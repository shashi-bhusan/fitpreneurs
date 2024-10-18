const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const Customer = require("../models/customer");
const Employee = require("../models/employee");

exports.handleCustomerExport = async (req, res) => {
  try {
    const customers = await Customer.find({});

    //convert to json then to worksheet
    const customerData = customers.map((customer) => customer.toObject());
    const worksheet = XLSX.utils.json_to_sheet(customerData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");

    //save
    const filePath = path.join(__dirname, "customers.xlsx");
    XLSX.writeFile(workbook, filePath);

    //send the file
    res.download(filePath, (err) => {
      if (err) {
        console.log(err);
        res.status(500).send("Could not download the file.");
      }
      //delete the file after sending
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

exports.handleEmployeeExport = async (req, res) => {
  try {
    const employees = await Employee.find({});

    // Convert to JSON then to worksheet
    const employeeData = employees.map((employee) => employee.toObject());
    const worksheet = XLSX.utils.json_to_sheet(employeeData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");

    // Save the workbook to a file
    const filePath = path.join(__dirname, "employees.xlsx");
    XLSX.writeFile(workbook, filePath);

    // Send the file
    res.download(filePath, (err) => {
      if (err) {
        console.log(err);
        res.status(500).send("Could not download the file.");
      }
      // Delete the file after sending
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

//Export employees with sessions

exports.handleCustomerWithSessionExport = async (req, res) => {
  try {
    const query = {
      sessionType: { $ne: "0 Sessions" }
    };
    const customers = await Customer.find(query);

    //convert to json then to worksheet
    const customerData = customers.map((customer) => customer.toObject());
    const worksheet = XLSX.utils.json_to_sheet(customerData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");

    //save
    const filePath = path.join(__dirname, "customers.xlsx");
    XLSX.writeFile(workbook, filePath);

    //send the file
    res.download(filePath, (err) => {
      if (err) {
        console.log(err);
        res.status(500).send("Could not download the file.");
      }
      //delete the file after sending
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

// Export customers who paid with cash
exports.handleCashPaymentCustomerExport = async (req, res) => {
  try {
    const query = { paymentMode: "cash" };
    const customers = await Customer.find(query);

    // Convert to JSON then to worksheet
    const customerData = customers.map((customer) => customer.toObject());
    const worksheet = XLSX.utils.json_to_sheet(customerData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cash Customers");

    // Save the workbook to a file
    const filePath = path.join(__dirname, "cash_customers.xlsx");
    XLSX.writeFile(workbook, filePath);

    // Send the file
    res.download(filePath, (err) => {
      if (err) {
        console.log(err);
        res.status(500).send("Could not download the file.");
      }
      // Delete the file after sending
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

// Export customers who paid with online payments
exports.handleOnlinePaymentCustomerExport = async (req, res) => {
  try {
    const query = { paymentMode: "online" };
    const customers = await Customer.find(query);

    // Convert to JSON then to worksheet
    const customerData = customers.map((customer) => customer.toObject());
    const worksheet = XLSX.utils.json_to_sheet(customerData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Online Customers");

    // Save the workbook to a file
    const filePath = path.join(__dirname, "online_customers.xlsx");
    XLSX.writeFile(workbook, filePath);

    // Send the file
    res.download(filePath, (err) => {
      if (err) {
        console.log(err);
        res.status(500).send("Could not download the file.");
      }
      // Delete the file after sending
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

