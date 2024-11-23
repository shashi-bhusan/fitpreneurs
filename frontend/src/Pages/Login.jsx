import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import config from "../config/config";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${config.apiBaseUrl}/login`, {
        emailId: email, 
        password: password,
      });

      if (response.status === 200) {
        // Save the token to localStorage
        localStorage.setItem('token', response.data.token);
        // Navigate to the home page
        navigate("/");
      }
    } catch (error) {
      console.log("Error", error.response ? error.response.data : error.message);
      alert("There was an error during login. Please try again.");
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-stone-800">
      <div className="bg-stone-700 bg-opacity-70 text-white rounded-lg shadow-lg p-8 w-96">
        <div>
          <h1 className="text-[2.5rem] font-bold py-3 text-center">Sign In</h1>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-2" controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                type="email" 
                placeholder="Enter email" 
              />
            </Form.Group>

            <Form.Group className="mb-2" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                type="password" 
                placeholder="Password" 
              />
            </Form.Group>

            <div className="text-[0.8rem] mb-3">
              Don't have an account?{" "}
              <span
                className="text-blue-500 hover:underline hover:text-blue-700 cursor-pointer"
                onClick={() => navigate("/signup")}
              >
                Sign up
              </span>
            </div>
            <div className="text-center">
              <Button variant="primary" type="submit">
                Sign in
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;
