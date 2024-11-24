import React, { useState, useEffect } from "react";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Select from "react-select";
import { useNavigate, useParams } from "react-router-dom";
import { BASE_URL } from "../utils/constants";

const AddCustomer = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    fullname: "",
    emailId: "",
    mobileNumber: "",
    dateOfBirth: "",
    address: "",
    plan: "",
    planDays: 0,
    planCost: "",
    membershipStartDate: "",
    sessionType: "0 Sessions",
    sessionCost: "",
    assignedEmployees: [],
    totalAmount: 0,
    payments: [], // New field for payments array
    planDebt: 0,
    sessionDebt: 0,
    paymentMode: "cash",
    paymentDate: "",
    initialPayment: "", // New field for first payment
  });
  const [isUpdate, setIsUpdate] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [showSessionOptions, setShowSessionOptions] = useState(false);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/employee?all=true`);
        setEmployees(response.data.employees.reverse());
      } catch (error) {
        console.error(error);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    const fetchCustomerData = async () => {
      if (id) {
        try {
          const response = await axios.get(`${BASE_URL}/customer/${id}`);
          const customer = response.data;

          const formattedDOB = customer.dateOfBirth
            ? customer.dateOfBirth.split("T")[0]
            : "";
          const formattedStartDate = customer.membershipStartDate
            ? customer.membershipStartDate.split("T")[0]
            : "";

          setFormData({
            fullname: customer.fullname,
            emailId: customer.emailId,
            mobileNumber: customer.mobileNumber,
            dateOfBirth: formattedDOB,
            address: customer.address,
            plan: customer.plan,
            planDays: customer.planDays,
            planCost: customer.planCost,
            sessionType: customer.sessionType,
            sessionCost: customer.sessionCost,
            membershipStartDate: formattedStartDate,
            assignedEmployees: customer.assignedEmployees,
            totalAmount: customer.totalAmount,
            amountPaid: customer.amountPaid,
            planDebt: customer.planDebt,
            sessionDebt: customer.sessionDebt,
            paymentMode: customer.paymentMode,
            paymentDate: customer.paymentDate,
          });
          console.log("formData", formData);

          setIsUpdate(true);
          setShowSessionOptions(customer.sessionType !== "0 Sessions");

          if (customer.assignedEmployees.length > 0) {
            const selectedEmps = employees
              .filter((emp) => customer.assignedEmployees.includes(emp._id))
              .map((emp) => ({
                value: emp._id,
                label: emp.fullname,
              }));
            setSelectedEmployees(selectedEmps);
          }
        } catch (error) {
          console.error("Error fetching customer data:", error);
        }
      }
    };

    if (id) {
      setIsUpdate(true);
      fetchCustomerData();
    }
  }, [id, employees]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    if (name === "planCost" || name === "sessionCost") {
      calculateTotal({ ...formData, [name]: value });
    }

    // if (name === "initialPayment" && value !== "") {
    //   const payment = parseFloat(value) || 0;
    //   const total = formData.totalAmount;
    //   setFormData((prev) => ({
    //     ...prev,
    //     initialPayment: payment,
    //     planDebt: total - payment,
    //   }));
    // }
  };

  const handleCheckboxChange = (event) => {
    setShowSessionOptions(event.target.checked);

    if (!event.target.checked) {
      calculateTotal({
        ...formData,
        sessionType: "",
        sessionCost: 0,
      });
    }
  };

  const calculateTotal = (updatedFormData) => {
    let total = 0;
    const { plan, sessionType, amountPaid, planCost, sessionCost } =
      updatedFormData;

    if (plan) {
      total += parseFloat(planCost) || 0;
    }

    if (sessionType) {
      total += parseFloat(sessionCost) || 0;
    }

    // const planDebt = total - (amountPaid ? parseFloat(amountPaid) : 0);

    setFormData((prevState) => ({
      ...prevState,
      totalAmount: total,
      // planDebt: planDebt,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const assignedEmployees = selectedEmployees.map((emp) => emp.value);
    const initialPayment = parseFloat(formData.initialPayment) || 0;

    // Validate and format the data
    const dataToSend = {
      fullname: formData.fullname.trim(),
      emailId: formData.emailId.trim(),
      mobileNumber: formData.mobileNumber.trim(),
      dateOfBirth: formData.dateOfBirth,
      address: formData.address.trim(),
      plan: formData.plan,
      planDays: Number(formData.planDays),
      planCost: Number(formData.planCost),
      membershipStartDate: formData.membershipStartDate,
      totalAmount: Number(formData.totalAmount),
      initialPayment: initialPayment, 
      planDebt: Number(formData.planDebt),
      paymentMode: formData.paymentMode, 
      paymentDate: formData.paymentDate, 
      assignedEmployees: assignedEmployees,
    };
    console.log("data", dataToSend);

    if (showSessionOptions) {
      dataToSend.sessionType = formData.sessionType;
      dataToSend.sessionCost = Number(formData.sessionCost);
      dataToSend.sessionDebt = Number(formData.sessionDebt);
    } else {
      dataToSend.sessionType = "0 Sessions";
      dataToSend.sessionCost = 0;
      dataToSend.sessionDebt = 0;
    }

    try {
      const url = isUpdate
        ? `${BASE_URL}/customer/${id}`
        : `${BASE_URL}/customer`;

      const method = isUpdate ? "put" : "post";

      const response = await axios({
        method,
        url,
        data: dataToSend,
        headers: { "Content-Type": "application/json" },
      });

      alert(
        isUpdate
          ? "Customer updated successfully!"
          : "Customer added successfully!"
      );
      navigate(`/client/${response.data._id}`, { state: response.data });
    } catch (error) {
      console.error("Error submitting form:", error);
      const errorMessage = error.response?.data?.message || error.message;
      alert(`Error: ${errorMessage}`);
    }
  };

  // UI PART
  return (
    <div className="h-[800] ml-1 p-4 sm:p-10 overflow-y-auto">
      <div className="min-h-screen text-white bg-stone-700 bg-opacity-50 rounded-lg p-4 sm:p-8">
        <Form onSubmit={handleSubmit} className="h-full">
          <Form.Group className="mb-3" controlId="formBasicName">
            <Form.Label>Full Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ramesh Yadav"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <div className="w-full flex justify-around space-x-8">
            <div className="w-1/2">
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="ramesh@gmail.com"
                  name="emailId"
                  value={formData.emailId}
                  onChange={handleChange}
                />
              </Form.Group>
            </div>

            <div className="w-1/2">
              <Form.Group className="mb-3" controlId="formBasicMobile">
                <Form.Label>Mobile Number</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="123-456-7890"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </div>
          </div>

          <div className="w-full flex justify-around space-x-8">
            <div className="w-1/2">
              <Form.Group className="mb-3" controlId="formBasicDOB">
                <Form.Label>Date of Birth</Form.Label>
                <Form.Control
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              </Form.Group>
            </div>

            <div className="w-1/2">
              <Form.Group className="mb-3" controlId="formBasicAddress">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Gandhi Nagar, Delhi, India"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </Form.Group>
            </div>
          </div>

          <div
            className={`grid grid-cols-1 ${
              formData.plan == "Per Day" ? "sm:grid-cols-4" : "sm:grid-cols-3"
            } gap-3 mb-3`}
          >
            <Form.Group controlId="formBasicPlan" className="w-full">
              <Form.Label>Membership Plan</Form.Label>
              <Form.Control
                as="select"
                name="plan"
                value={formData.plan}
                onChange={handleChange}
                required
              >
                <option value="">Select Plan</option>
                <option value="Per Day">Per Day</option>
                <option value="1 month">1 Month</option>
                <option value="3 months">3 Months</option>
                <option value="6 months">6 Months</option>
                <option value="12 months">12 Months</option>
              </Form.Control>
            </Form.Group>

            {formData.plan == "Per Day" && (
              <Form.Group controlId="formBasicPlanDays" className="w-full">
                <Form.Label>Days</Form.Label>
                <Form.Control
                  type="number"
                  name="planDays"
                  value={formData.planDays}
                  onChange={handleChange}
                  disabled={!formData.plan}
                />
              </Form.Group>
            )}

            <Form.Group controlId="formBasicPlanStartDate" className="w-full">
              <Form.Label>Plan Start Date</Form.Label>
              <Form.Control
                type="date"
                name="membershipStartDate"
                value={formData.membershipStartDate}
                onChange={handleChange}
                required
                min="2024-01-01" // Set the minimum date to January 1, 2024
              />
            </Form.Group>

            <Form.Group controlId="formBasicPlanCost" className="w-full">
              <Form.Label>Plan Cost</Form.Label>
              <Form.Control
                type="number"
                name="planCost"
                value={formData.planCost}
                onChange={handleChange}
                disabled={!formData.plan}
                required
              />
            </Form.Group>
          </div>

          <Form.Group controlId="formBasicShowSession" className="mb-3">
            <Form.Check
              type="checkbox"
              label="Include Sessions"
              checked={showSessionOptions}
              onChange={handleCheckboxChange}
            />
          </Form.Group>

          {showSessionOptions && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <Form.Group controlId="formBasicSessionType" className="w-full">
                <Form.Label>Session Type</Form.Label>
                <Form.Control
                  as="select"
                  name="sessionType"
                  value={formData.sessionType}
                  onChange={handleChange}
                  disabled={!showSessionOptions}
                >
                  <option value="">Select Session</option>
                  <option value="1 session">1 Session</option>
                  <option value="12 sessions">12 Sessions</option>
                  <option value="24 sessions">24 Sessions</option>
                  <option value="12 sessions (couple)">
                    12 Sessions (Couple)
                  </option>
                  <option value="24 sessions (couple)">
                    24 Sessions (Couple)
                  </option>
                </Form.Control>
              </Form.Group>

              <Form.Group controlId="formBasicSessionCost" className="w-full">
                <Form.Label>Session Cost</Form.Label>
                <Form.Control
                  type="number"
                  name="sessionCost"
                  value={formData.sessionCost}
                  onChange={handleChange}
                  disabled={!formData.sessionType}
                />
              </Form.Group>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <Form.Group controlId="formBasicTotalAmount" className="w-full">
              <Form.Label>Total Amount</Form.Label>
              <Form.Control
                type="number"
                name="totalAmount"
                value={formData.totalAmount}
                readOnly
              />
            </Form.Group>

            <Form.Group controlId="formBasicInitialPayment" className="w-full">
              <Form.Label>Initial Payment</Form.Label>
              <Form.Control
                type="number"
                name="initialPayment"
                value={formData.initialPayment}
                onChange={handleChange}
                max={formData.totalAmount}
              />
            </Form.Group>

            <Form.Group controlId="formBasicPaymentMode" className="w-full">
              <Form.Label>Payment Mode</Form.Label>
              <Form.Control
                as="select"
                name="paymentMode"
                value={formData.paymentMode}
                onChange={handleChange}
              >
                <option value="cash">Cash</option>
                <option value="online">Online</option>
                <option value="upi">UPI</option>
              </Form.Control>
            </Form.Group>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3">
            <Form.Group controlId="formBasicDebt" className="w-full">
              <Form.Label>Plan Debt</Form.Label>
              <Form.Control
                type="number"
                name="planDebt"
                value={formData.planDebt}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="formBasicDebt" className="w-full">
              <Form.Label>Session Debt</Form.Label>
              <Form.Control
                type="number"
                name="sessionDebt"
                value={formData.sessionDebt}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="formBasicDate" className="w-full">
              <Form.Label>Payment Date</Form.Label>
              <Form.Control
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleChange}
              />
            </Form.Group>

            <div className="w-full">
              <label className="block mb-1">Assigned Employees</label>
              <Select
                isMulti
                options={employees.map((emp) => ({
                  value: emp._id,
                  label: emp.fullname,
                }))}
                onChange={setSelectedEmployees}
                value={selectedEmployees}
                className="text-black"
              />
            </div>
          </div>

          <Button variant="primary" type="submit">
            {isUpdate ? "Update Customer" : "Add Customer"}
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default AddCustomer;
