import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import config from "../config/config";

const ExpiringMemberships = () => {
  const [expiringCustomers, setExpiringCustomers] = useState([]);

  useEffect(() => {
    fetchExpiringCustomers();
  }, []);

  const fetchExpiringCustomers = async () => {
    try {
      const response = await axios.get(
        `${config.apiBaseUrl}/customer/expiring-memberships`
      );
      const customers = response.data.filter((customer) => {
        const daysLeft = moment(customer.membershipEndDate).diff(
          moment(),
          "days"
        );
        return daysLeft <= 10 && daysLeft >= 0; // Memberships expiring within 10 days
      });
      setExpiringCustomers(customers);
    } catch (error) {
      console.error("Error fetching expiring memberships", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="bg-gray-800 text-white w-full max-w-4xl rounded-lg shadow-lg p-6">
        <div className="flex flex-col justify-center items-center mb-8">
          <h1 className="text-white font-serif text-3xl mb-3 font-semibold">
            Expiring Memberships
          </h1>
          <div className="rounded-full overflow-hidden">
            <img src="/warning.gif" alt="warning" className="h-32" />
          </div>
        </div>

        {expiringCustomers.length > 0 ? (
          expiringCustomers.map((customer) => {
            const daysLeft = moment(customer.membershipEndDate).diff(
              moment(),
              "days"
            );
            return (
              <div
                key={customer._id}
                className="bg-stone-700 bg-opacity-45 p-4 mb-4 rounded-lg shadow-md"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xl font-semibold">{customer.fullname}</p>
                    <p>
                      <strong>Email:</strong> {customer.emailId}
                    </p>
                    <p>
                      <strong>Mobile:</strong> {customer.mobileNumber}
                    </p>
                    <p>
                      <strong>Address:</strong> {customer.address}
                    </p>
                  </div>
                  <div className="flex flex-col justify-between">
                    <p className="text-lg">
                      <strong>Membership Ends:</strong>{" "}
                      {moment(customer.membershipEndDate).format(
                        "MMMM Do YYYY"
                      )}
                    </p>
                    <p
                      className={`text-xl font-bold mt-2 ${
                        daysLeft <= 3 ? "text-red-500" : "text-yellow-500"
                      }`}
                    >
                      {daysLeft} {daysLeft === 1 ? "day" : "days"} left
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-lg">
            No memberships expiring within the next 10 days.
          </p>
        )}
      </div>
    </div>
  );
};

export default ExpiringMemberships;
