import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobileNumber: "",
    address: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:8000/api/employee", {
        fullname: formData.name,
        emailId: formData.email,
        mobileNumber: formData.mobileNumber,
        address: formData.address,
        password: formData.password,
      });

      if (response.status === 201) {
        alert("Signup successful!");
        setFormData({
          name: "",
          email: "",
          password: "",
          mobileNumber: "",
          address: "",
        });
        navigate("/employees");
      }
    } catch (error) {
      console.error("Error during signup:", error);
      alert("There was an error during signup. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center bg-stone-800 h-screen">
      <div className="bg-stone-700 bg-opacity-70 text-white rounded-lg shadow-lg p-8 w-[28rem] m-4">
        <div>
          <h1 className="text-3xl font-bold py-2 text-center mb-6">Add New Personal Trainer</h1>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formName">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="John Doe"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="johndoe@gmail.com"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-2" controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formMobileNumber">
              <Form.Label>Mobile Number</Form.Label>
              <Form.Control
                type="text"
                placeholder="123-456-7890"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formAddress">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                placeholder="123 Main St, Anytown, USA"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </Form.Group>

            <div className="text-[0.8rem] mb-3">
              Already have an account?{" "}
              <span
                className="text-blue-500 hover:underline hover:text-blue-700 cursor-pointer"
                onClick={() => navigate("/login")}
              >
                Sign in
              </span>
            </div>
            <div className="text-center">
              <Button variant="primary" type="submit">
                Sign Up
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
