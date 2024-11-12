const Customer = require("../models/customer");
const Employee = require("../models/employee");
const moment = require("moment");

// Create a new customer
exports.createCustomer = async (req, res) => {
  try {
    const {
      plan,
      planCost = 0,
      sessionType = "",
      sessionCost = 0,
      initialPayment = 0,
      paymentMode = "cash",
      membershipStartDate,
    } = req.body;

    // Validate planStartDate
    const startDate = new Date(membershipStartDate);
    const minStartDate = new Date("2024-01-01");

    if (startDate < minStartDate) {
      return res
        .status(400)
        .json({ message: "Plan start date cannot be before January 1, 2024." });
    }

    // Ensure all costs are numbers
    const planCostNum = parseFloat(planCost);
    const sessionCostNum = parseFloat(sessionCost);
    const initialPaymentNum = parseFloat(initialPayment);

    // Calculate total amount and debt
    const totalAmount = planCostNum + sessionCostNum;
    const debt = totalAmount - initialPaymentNum;

    // Calculate membershipEndDate based on the selected plan and start date
    let membershipEndDate;

    switch (plan) {
      case "Per Day":
        membershipEndDate = new Date(startDate);
        membershipEndDate.setDate(startDate.getDate() + 1);
        break;
      case "1 month":
        membershipEndDate = new Date(startDate);
        membershipEndDate.setMonth(startDate.getMonth() + 1);
        break;
      case "3 months":
        membershipEndDate = new Date(startDate);
        membershipEndDate.setMonth(startDate.getMonth() + 3);
        break;
      case "6 months":
        membershipEndDate = new Date(startDate);
        membershipEndDate.setMonth(startDate.getMonth() + 6);
        break;
      case "12 months":
        membershipEndDate = new Date(startDate);
        membershipEndDate.setFullYear(startDate.getFullYear() + 1);
        break;
      default:
        return res.status(400).json({ message: "Invalid membership plan." });
    }

    // Create initial payment record if amount paid > 0
    const payments = [];
    if (initialPaymentNum > 0) {
      payments.push({
        amount: initialPaymentNum,
        date: new Date(),
        mode: paymentMode,
      });
    }

    // Create customer object
    const customer = new Customer({
      ...req.body,
      membershipEndDate,
      totalAmount,
      debt,
      payments,
    });

    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all customers with optional filters
exports.getAllCustomers = async (req, res) => {
  try {
    const { search, filter, page = 1, limit = 8, all } = req.query;
    const query = {};

    // Search by fullname, emailId, mobileNumber, or address
    if (search) {
      query.$or = [
        { fullname: { $regex: search, $options: "i" } },
        { emailId: { $regex: search, $options: "i" } },
        { mobileNumber: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by date
    if (filter === "last7Days") {
      query.createdAt = {
        $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
      };
    } else if (filter === "last30Days") {
      query.createdAt = {
        $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
      };
    }

    // If the "all" flag is true, return all customers without pagination
    if (all === "true") {
      const customers = await Customer.find(query).sort({ createdAt: -1 }); // Sort by newest first
      return res.status(200).json({
        customers,
        total: customers.length,
        page: 1,
        pages: 1,
      });
    }

    // Otherwise, paginate the results
    const pageNum = parseInt(page, 10); //parsing base 10
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum; //skips prev page's data

    const [customers, totalCustomers] = await Promise.all([
      Customer.find(query)
        .sort({ createdAt: -1 }) // Sort by newest first
        .skip(skip)
        .limit(limitNum),
      Customer.countDocuments(query),
    ]);

    res.status(200).json({
      customers,
      total: totalCustomers,
      page: pageNum,
      pages: Math.ceil(totalCustomers / limitNum),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a customer by ID
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a customer
exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });
    res.status(200).json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a customer
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });
    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE ALL FOR DEV
exports.deleteAllCustomers = async (req, res) => {
  try {
    const result = await Customer.deleteMany({});
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "No customers found to delete" });
    }
    res.status(200).json({
      message: "All customers deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get revenue based on filters
exports.getRevenue = async (req, res) => {
  try {
    const { filter, year, month } = req.query;
    let start, end;

    // Determine date range based on filter or default to current month
    if (filter === "specificMonth" && year && month) {
      start = new Date(year, month - 1, 1); // month is 0-indexed
      end = new Date(year, month, 1);
    } else {
      // Default to current month if no specific filter is provided
      start = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      end = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
    }

    const match = {
      "payments.date": {
        $gte: start,
        $lt: end,
      },
    };

    // Aggregate revenue
    const revenue = await Customer.aggregate([
      { $unwind: "$payments" },
      { $match: match },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$payments.amount" },
          membershipRevenue: { $sum: "$planCost" },
          sessionRevenue: { $sum: "$sessionCost" },
        },
      },
    ]);

    // Handle case when no data is returned
    if (revenue.length === 0) {
      return res.status(200).json({
        totalRevenue: 0,
        membershipRevenue: 0,
        sessionRevenue: 0,
      });
    }

    res.status(200).json(revenue[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Expiring Clients
exports.getExpiringMemberships = async (req, res) => {
  try {
    // Get the current date and the date 7 days from now
    const today = moment().startOf("day");
    const nextWeek = moment().add(7, "days").endOf("day");

    // Find customers whose membership end date falls within the next 7 days
    const expiringCustomers = await Customer.find({
      membershipEndDate: {
        $gte: today.toDate(),
        $lte: nextWeek.toDate(),
      },
    });

    // Send the expiring customers as the response
    res.status(200).json(expiringCustomers);
  } catch (error) {
    console.error("Error fetching expiring memberships:", error);
    res.status(500).json({ error: "Failed to fetch expiring memberships" });
  }
};

exports.getUpcomingBirthdays = async (req, res) => {
  try {
    const today = moment().startOf("day");
    const nextWeek = moment().add(7, "days").endOf("day");

    // Get customers with upcoming birthdays
    const customers = await Customer.find();

    // Filter customers with birthdays within the next 7 days (month and day)
    const upcomingBirthdays = customers.filter((customer) => {
      const dob = moment(customer.dateOfBirth); // Customer's birthdate (month/day only)
      const currentYearDob = dob.clone().year(today.year()); // Set the customer's birthdate to this year

      // Check if the birthday is within the next 7 days
      return currentYearDob.isBetween(today, nextWeek, null, "[]"); // Inclusive comparison
    });

    res.status(200).json(upcomingBirthdays);
  } catch (error) {
    console.error("Error fetching upcoming birthdays:", error);
    res.status(500).json({ error: "Failed to fetch upcoming birthdays" });
  }
};

// Update Payment
exports.addPayment = async (req, res) => {
  try {
    const { amount, mode = 'cash', date } = req.body;
    const customerId = req.params.id;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const paymentAmount = parseFloat(amount);

    // Create payment object with optional date
    const payment = {
      amount: paymentAmount,
      mode,
      date: date ? new Date(date) : new Date() // Use provided date or current date
    };

    // Add new payment
    customer.payments.push(payment);

    // Recalculate debt
    const totalPaid = customer.payments.reduce((sum, p) => sum + p.amount, 0);
    customer.debt = customer.totalAmount - totalPaid;

    await customer.save();
    res.status(200).json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getPaymentHistory = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Sort payments by date in descending order
    const payments = [...customer.payments].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );

    res.status(200).json({
      customerId: customer._id,
      customerName: customer.fullname,
      totalAmount: customer.totalAmount,
      debt: customer.debt,
      payments: payments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};