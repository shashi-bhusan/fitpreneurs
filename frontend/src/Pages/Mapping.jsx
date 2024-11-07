import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import axios from "axios";
import Select from "react-select";

const Mapping = () => {
  const [employees, setEmployees] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [sessionType, setSessionType] = useState("");
  const [sessionCost, setSessionCost] = useState("");
  const [paidCost, setPaidCost] = useState("");
  const [paymentMode, setPaymentMode] = useState(""); // New state for payment mode
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const sessionTypes = [
    { value: "12 Sessions", label: "12 Sessions" },
    { value: "24 Sessions", label: "24 Sessions" },
    { value: "12 Sessions (Couple)", label: "12 Sessions (Couple)" },
    { value: "24 Sessions (Couple)", label: "24 Sessions (Couple)" }
  ];

  const paymentModes = [
    { value: "cash", label: "Cash" },
    { value: "online", label: "Online" },
    { value: "upi", label: "UPI" }

  ];

  useEffect(() => {
    axios.get("https://server.fitpreneursapiens.com/api/employee?all=true")
      .then((response) => setEmployees(response.data.employees.reverse()))
      .catch((error) => console.error(error));

    axios.get("https://server.fitpreneursapiens.com/api/customer?all=true")
      .then((response) => setCustomers(response.data.customers))
      .catch((error) => console.error(error));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCustomer || !selectedEmployee || !sessionType || !sessionCost || !paidCost || !paymentMode) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    axios.post("https://server.fitpreneursapiens.com/api/employee/assign", {
      customerId: selectedCustomer.value,
      employeeId: selectedEmployee.value,
      sessionType,
      sessionCost: parseFloat(sessionCost),
      paidCost: parseFloat(paidCost),
      paymentMode // Add payment mode in the payload
    })
      .then((response) => {
        setSuccessMessage(response.data.message);
        setErrorMessage("");
        setSelectedEmployee(null);
        setSelectedCustomer(null);
        setSessionType("");
        setSessionCost("");
        setPaidCost("");
        setPaymentMode(""); // Reset payment mode
      })
      .catch((error) => {
        if (error.response && error.response.data) {
          setErrorMessage(error.response.data.message || "Error mapping customer to employee.");
        } else {
          setErrorMessage("An unknown error occurred.");
        }
        setSuccessMessage("");
      });
  };

  const handleSessionTypeChange = (selectedOption) => {
    setSessionType(selectedOption.value);
    setSessionCost("");
    setPaidCost("");
  };

  return (
    <div className="h-screen ml-1 p-10">
      <div className="max-h-screen bg-stone-700 bg-opacity-50 rounded-lg text-white p-8">
        <Form onSubmit={handleSubmit}>
          {/* Client Select */}
          <Form.Group className="mb-3 text-black" controlId="formCustomerSelect">
            <Form.Label className="text-white">Search and Select Client</Form.Label>
            <Select
              value={selectedCustomer}
              onChange={setSelectedCustomer}
              options={customers.map((customer) => ({
                value: customer._id,
                label: `${customer.fullname} (Phone Number: ${customer.mobileNumber})`
              }))}
              placeholder="Search and select a client"
              isSearchable
            />
          </Form.Group>

          {/* Trainer Select */}
          <Form.Group className="mb-3 text-black" controlId="formEmployeeSelect">
            <Form.Label className="text-white">Search and Select Personal Trainer</Form.Label>
            <Select
              value={selectedEmployee}
              onChange={setSelectedEmployee}
              options={employees.map((employee) => ({
                value: employee._id,
                label: `${employee.fullname} (Phone Number: ${employee.mobileNumber})`
              }))}
              placeholder="Search and select a Personal Trainer"
              isSearchable
            />
          </Form.Group>

          {/* Session Type Select */}
          <Form.Group className="mb-3 text-black" controlId="formSessionTypeSelect">
            <Form.Label className="text-white">Select Session Type</Form.Label>
            <Select
              value={sessionType ? sessionTypes.find(option => option.value === sessionType) : null}
              onChange={handleSessionTypeChange}
              options={sessionTypes}
              placeholder="Select session type"
            />
          </Form.Group>

          {/* Session Cost and Paid Cost */}
          <div className="grid grid-cols-3 gap-4">
            <Form.Group className="mb-3" controlId="formSessionCost">
              <Form.Label className="text-white">Session Cost</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter session cost"
                value={sessionCost}
                onChange={(e) => setSessionCost(e.target.value)}
                disabled={!sessionType}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formPaidCost">
              <Form.Label className="text-white">Paid Cost</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter paid cost"
                value={paidCost}
                onChange={(e) => setPaidCost(e.target.value)}
                disabled={!sessionType}
              />
            </Form.Group>

            {/* Payment Mode Dropdown */}
            <Form.Group className="mb-3" controlId="formPaymentMode">
              <Form.Label className="text-white">Payment Mode</Form.Label>
              <Select
                value={paymentMode ? paymentModes.find(option => option.value === paymentMode) : null}
                onChange={(selectedOption) => setPaymentMode(selectedOption.value)}
                options={paymentModes}
                placeholder="Select payment mode"
                className="text-black"
              />
            </Form.Group>
          </div>

          {/* Submit Button */}
          <Button variant="primary" type="submit">
            Assign Client to Personal Trainer
          </Button>
        </Form>

        {/* Success Message */}
        {successMessage && (
          <div style={{ color: 'green', marginTop: '10px' }} className="bg-stone-900 font-semibold bg-opacity-90 w-max px-3 py-1 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div style={{ color: 'red', marginTop: '10px' }} className="bg-stone-900 font-semibold bg-opacity-90 w-max px-3 py-1 rounded-lg">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default Mapping;
