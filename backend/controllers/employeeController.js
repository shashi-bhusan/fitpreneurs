const Employee = require("../models/employee");
const Customer =require("../models/customer");

// Create a new employee
exports.createEmployee = async (req, res) => {
  try {
    const employee = new Employee(req.body);
    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// Get all employees with pagination, search, and filter
exports.getAllEmployees = async (req, res) => {
  try {
    const { search, filter, page = 1, limit = 8, all } = req.query;
    const query = {};

    // Search
    if (search) {
      query.$or = [
        { fullname: { $regex: search, $options: "i" } },
        { emailId: { $regex: search, $options: "i" } },
        { mobileNumber: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }

    // Filter
    if (filter === "last7Days") {
      query.createdAt = {
        $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
      };
    } else if (filter === "last30Days") {
      query.createdAt = {
        $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
      };
    }

    if (all === 'true') {
      // Fetch all employees that match the query without pagination
      const employees = await Employee.find(query);
      res.status(200).json({
        employees,
        total: employees.length,
        page: 1, // Placeholder value
        pages: 1, // Placeholder value
      });
    } else {
      // Pagination
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      const [employees, totalEmployees] = await Promise.all([
        Employee.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
        Employee.countDocuments(query),
      ]);

      res.status(200).json({
        employees,
        total: totalEmployees,
        page: pageNum,
        pages: Math.ceil(totalEmployees / limitNum),
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Get an employee by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an employee
exports.updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    res.status(200).json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete an employee
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//delete All
exports.deleteAllEmployee = async (req, res) => {
  try {
    const result = await Employee.deleteMany({});
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "No customers found to delete" });
    }
    res.status(200).json({ message: "All Employees deleted successfully", deletedCount: result.deletedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//get customers under employees
exports.getCustomersByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Find all customers that have the given employee in their assignedEmployees array
    const customers = await Customer.find({ assignedEmployees: employeeId });

    if (customers.length === 0) {
      return res.status(404).json({ message: "No customers assigned to this employee" });
    }

    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




//Customer Mapping
exports.assignCustomerToEmployee = async (req, res) => {
  try {
    const { customerId, employeeId, sessionType, sessionCost, paidCost, paymentMode, paymentDate } = req.body;

    // Find the customer
    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    
    // Check if the employee is already assigned to the customer
    if (customer.assignedEmployees.includes(employeeId)) {
      return res.status(400).json({ message: "Employee already assigned to this customer" });
    }

    // Add the employee to the customer's assignedEmployees array
    customer.assignedEmployees.push(employeeId);

    // Update the sessionType and sessionCost
    customer.sessionType = sessionType;
    customer.sessionCost = sessionCost;

    // Update the totalAmount, amountPaid, and planDebt
    customer.totalAmount += sessionCost;
    customer.amountPaid += paidCost;
    customer.sessionDebt +=  sessionCost - paidCost;

    customer.payments.push({
      amount: paidCost,
      mode: paymentMode,
      date: new Date(paymentDate),
      type: "session",
    });

    // Save the updated customer
    await customer.save();

    res.status(200).json({ message: "Employee and payment details updated successfully", customer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




