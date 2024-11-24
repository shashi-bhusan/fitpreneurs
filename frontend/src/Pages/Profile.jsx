import React, { useEffect, useState } from "react";
import {jwtDecode} from "jwt-decode"; // Corrected import
import axios from "axios";
import config from "../config/config";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token"); // assuming you store the token in localStorage
    if (token) {
      const decoded = jwtDecode(token);
      setUser(decoded);
      fetchCustomers(decoded.adminId); // Fetch customers for this employee
    }
  }, []);

  const fetchCustomers = async (employeeId) => {
    try {
      const response = await axios.get(`${config.apiBaseUrl}/employee/${employeeId}/customers`);
      console.log("Fetched customers:", response.data);
      setCustomers(response.data);
    } catch (error) {
      console.error("Error fetching customers", error);
    }
  };

  const handleCustomerSelect = (event) => {
    const customerId = event.target.value;
    const customer = customers.find(cust => cust._id === customerId);
    setSelectedCustomer(customer);
  };

  if (!user) return null;

  return (
    <div className="flex flex-col md:flex-row justify-around space-y-4 md:space-y-0 py-3 items-center">
      <div className=" bg-stone-700 bg-opacity-50 px-16 py-4 rounded-lg">
        <div className="flex flex-col justify-center items-center">
          <h1 className="text-white font-serif text-3xl mb-3 font-semibold">My Details</h1>
          <div className="rounded-full overflow-hidden">
            <img src="/personal-trainer.gif" alt="gif" className="h-36" />
          </div>
        </div>
        <div className="space-y-3 p-2 font-base mt-6 text-white">
          <p><strong className=" capitalize">Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Mobile:</strong> {user.mobile}</p>
          <p className="capitalize"><strong>Address:</strong> {user.address}</p>
          <p className="capitalize"><strong>Role:</strong> {user.role}</p>
        </div>
      </div>

      {/* CUSTOMERS */}
      <div className=" bg-stone-700 bg-opacity-50 px-16 py-3 rounded-lg">
        <div className="flex flex-col justify-center items-center">
          <h1 className="text-white font-serif text-3xl mb-3 font-semibold">My Customers</h1>
          <div className="rounded-full overflow-hidden">
            <img src="/gymmm.gif" alt="gif" className="h-36" />
          </div>
        </div>
        <div className="space-y-1 p-2 font-base mt-2 text-white">
          <select onChange={handleCustomerSelect} className="w-full px-2 py-1 rounded bg-stone-800 bg-opacity-50">
            <option value="" >View All Customers</option>
            {customers.map((customer) => (
              <option key={customer._id} value={customer._id} className="capitalize">
                {customer.fullname}
              </option>
            ))}
          </select>

          {selectedCustomer && (
            <div className="mt-2 space-y-3">
              <p className="capitalize"><strong>Full Name:</strong> {selectedCustomer.fullname}</p>
              <p><strong>Email:</strong> {selectedCustomer.emailId}</p>
              <p><strong>Mobile:</strong> {selectedCustomer.mobileNumber}</p>
              <p className="capitalize"><strong>Address:</strong> {selectedCustomer.address}</p>
              <p><strong>Plan:</strong> {selectedCustomer.plan}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
