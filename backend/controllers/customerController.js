const Customer = require("../models/customer");
const Employee = require("../models/employee");
const moment = require("moment");
const mongoose = require("mongoose");

// Create a new customer
exports.createCustomer = async (req, res) => {
  try {
    const {
      plan,
      planDays = 0,
      planCost = 0,
      sessionType = "",
      sessionCost = 0,
      initialPayment = 0,
      paymentMode = "cash",
      paymentDate,
      planDebt,
      sessionDebt,
      membershipStartDate,
      assignedEmployees
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

    // Calculate total amount and planDebt
    const totalAmount = planCostNum + sessionCostNum;
    // const planDebt = totalAmount - initialPaymentNum;

    // Calculate membershipEndDate based on the selected plan and start date
    let membershipEndDate;

    switch (plan) {
      case "Per Day":
        membershipEndDate = new Date(startDate);
        membershipEndDate.setDate(startDate.getDate() + planDays);
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
      if (sessionCostNum > 0) {
        payments.push({
          amount: sessionCostNum - sessionDebt,
          type: "session",
          date: new Date(paymentDate),
          mode: paymentMode,
          notes: "session",
        });
      }
      if (planCostNum > 0) {
        payments.push({
          amount: planCostNum - planDebt,
          type: "plan",
          date: new Date(paymentDate),
          mode: paymentMode,
          notes: "membership",
        });
      }
    }

    const planHistory = [];
    planHistory.push({
      plan,
      startDate,
      endDate: membershipEndDate,
    });

    // Create customer object
    const customer = new Customer({
      ...req.body,
      membershipEndDate,
      totalAmount,
      planDebt,
      sessionDebt,
      amountPaid: initialPaymentNum,
      payments,
      planHistory,
      assignedEmployees: assignedEmployees.map((emp) => new mongoose.Types.ObjectId(emp)),
    });

    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    console.log(error);
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

exports.upgradeCustomer = async (req, res) => {
  try {
    const { plan, expiryDate, totalAmount } = req.body;

    const customer = await Customer.findById(req.params.id);

    const membershipStartDate = new Date(customer.membershipStartDate);
    const membershipEndDate = new Date(expiryDate);

    customer.plan = plan;
    customer.planCost = customer.planCost + Number(totalAmount);
    // customer.membershipStartDate = membershipStartDate;
    customer.membershipEndDate = membershipEndDate;
    customer.totalAmount = customer.totalAmount + Number(totalAmount);
    // customer.amountPaid = totalAmount;
    customer.planDebt = customer.planDebt + Number(totalAmount);

    customer.planHistory.push({
      plan,
      startDate: membershipStartDate,
      endDate: membershipEndDate,
    });

    // customer.payments.push({
    //   amount: totalAmount,
    //   mode,
    //   date: new Date(),
    //   type: "plan",
    //   notes,
    // });

    await customer.save();

    if (!customer)
      return res.status(404).json({ message: "Customer not found" });
    res.status(200).json(customer);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

exports.renewMembership = async (req, res) => {
  try {
    const { plan, totalAmount, planDays = 0 } = req.body;

    let { startDate } = req.body;

    // Ensure all costs are numbers
    const planCostNum = parseFloat(totalAmount);

    startDate = new Date(startDate);

    // Calculate membershipEndDate based on the selected plan and start date
    let membershipEndDate;

    switch (plan) {
      case "Per Day":
        membershipEndDate = new Date(startDate);
        membershipEndDate.setDate(startDate.getDate() + planDays);
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

    const customer = await Customer.findById(req.params.id);

    customer.plan = plan;
    customer.planDays = planDays;
    customer.planCost = totalAmount;
    customer.sessionCost = 0;
    customer.sessionType = "0 Sessions";
    customer.membershipStartDate = startDate;
    customer.membershipEndDate = membershipEndDate;
    customer.totalAmount = totalAmount;
    customer.amountPaid = 0;
    customer.planDebt += Number(totalAmount);

    customer.planHistory.push({
      plan,
      startDate: startDate,
      endDate: membershipEndDate,
    });

    // customer.payments.push({
    //   amount: totalAmount,
    //   mode,
    //   date: new Date(paymentDate),
    //   type: "plan",
    //   notes,
    // });

    await customer.save();
    res.status(200).json(customer);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

exports.updateCustomerStatus = async (req, res) => {
  try {
    const { status, freezeDays, totalAmount, notes, mode, paymentDate, freezeDate, expiryDate } =
      req.body;

    const customer = await Customer.findById(req.params.id);

    if (status === "freeze") {
      customer.status = status;
      customer.freezeDays = freezeDays;
      customer.freezeDate = new Date(freezeDate);

      if (totalAmount) {
        customer.payments.push({
          amount: totalAmount,
          mode,
          date: new Date(paymentDate),
          type: "freeze",
          notes: "freeze account",
        });
      }
    }

    if (status === "unfreeze") {
      customer.status = "active";
      customer.freezeDays = 0;
      customer.freezeDate = null;
      customer.membershipEndDate = new Date(expiryDate);

      if (totalAmount) {
        customer.payments.push({
          amount: totalAmount,
          mode,
          date: new Date(paymentDate),
          type: "freeze",
          notes: notes || "freeze account",
        });
      }
    }

    await customer.save();
    res.status(200).json(customer);
  } catch (error) {
    console.log(error);
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
    const { totalAmount, mode, notes, type, paymentDate } = req.body;
    const customerId = req.params.id;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    if(type == "planDebt"){
      customer.planDebt -= Number(totalAmount);
    }

    if(type == "sessionDebt"){
      customer.sessionDebt -= Number(totalAmount);
    }

    customer.amountPaid += Number(totalAmount);

    if (totalAmount) {
      customer.payments.push({
        amount: totalAmount,
        mode,
        date: new Date(paymentDate),
        type,
        notes,
      });
    }

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
      return res.status(404).json({ message: "Customer not found" });
    }

    // Sort payments by date in descending order
    const payments = [...customer.payments].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    // Calculate total amount paid
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    res.status(200).json({
      customerId: customer._id,
      customerName: customer.fullname,
      totalAmount: customer.totalAmount,
      amountPaid: customer.amountPaid,
      planCost: customer.planCost,
      sessionCost: customer.sessionCost,
      planDebt: customer.planDebt,
      sessionDebt: customer.sessionDebt,
      payments: payments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
