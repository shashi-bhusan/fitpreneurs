import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { FaDownload } from "react-icons/fa";
import fileDownload from "js-file-download";

const RevenuePage = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [revenueData, setRevenueData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [membershipRevenue, setMembershipRevenue] = useState(0);
  const [sessionRevenue, setSessionRevenue] = useState(0);
  const [cashRevenue, setCashRevenue] = useState(0); // New state for cash revenue
  const [onlineRevenue, setOnlineRevenue] = useState(0); // New state for online revenue

  const fetchCashOnline = async () => {
    try {
      const response = await axios.get("https://server.fitpreneursapiens.com/api/revenue/monthly-revenue");
      console.log("Cash and Online API Response:", response.data);
      setCashRevenue(response.data.cashRevenue || 0);
      setOnlineRevenue(response.data.onlineRevenue || 0);
    } catch (error) {
      console.error("Error fetching cash and online revenue data:", error);
    }
  };

  const fetchRevenueData = async (selectedDate) => {
    try {
      const currentYear = selectedDate.getFullYear();
      const currentMonth = selectedDate.getMonth() + 1;

      const apiUrl =
        selectedDate.getMonth() === new Date().getMonth() &&
        selectedDate.getFullYear() === new Date().getFullYear()
          ? `https://server.fitpreneursapiens.com/api/customer/revenue`
          : `https://server.fitpreneursapiens.com/api/customer/revenue?filter=specificMonth&month=${currentMonth}&year=${currentYear}`;

      const response = await axios.get(apiUrl);
      console.log("API Response:", response.data);

      setRevenueData(response.data.revenueData || []);
      setTotalRevenue(response.data.totalRevenue || 0);
      setMembershipRevenue(response.data.membershipRevenue || 0);
      setSessionRevenue(response.data.sessionRevenue || 0);
    } catch (error) {
      console.error("Error fetching revenue data:", error);
    }
  };

  useEffect(() => {
    fetchRevenueData(startDate);
    fetchCashOnline();
  }, [startDate]);

  const handleAllCashExport = async () => {
    try {
      const response = await axios.get("https://server.fitpreneursapiens.com/api/export/exportcustomers", {
        responseType: "blob",
      });
      fileDownload(response.data, "customers.xlsx");
    } catch (err) {
      console.error("Error exporting customers:", err);
    }
  };

  const handlePtExport = async () => {
    try {
      const response = await axios.get("https://server.fitpreneursapiens.com/api/export/exportcustomerwithpt", {
        responseType: "blob",
      });
      fileDownload(response.data, "customers_with_pt-Sessions.xlsx");
    } catch (err) {
      console.error("Error exporting customers with Sessions:", err);
    }
  };
  const handleCashExport = async () => {
    try {
      const response = await axios.get("https://server.fitpreneursapiens.com/api/export/customerpaidcash", {
        responseType: "blob",
      });
      fileDownload(response.data, "customers_paid_with_cash.xlsx");
    } catch (err) {
      console.error("Error exporting customers with Cash payment:", err);
    }
  };
  const handleOnlineExport = async () => {
    try {
      const response = await axios.get("https://server.fitpreneursapiens.com/api/export/customerpaidonline", {
        responseType: "blob",
      });
      fileDownload(response.data, "customers_paid_online.xlsx");
    } catch (err) {
      console.error("Error exporting customers with Online payment:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Header Section */}
      <div className="flex items-center justify-between flex-col md:flex-row mb-6 gap-y-3">
        <div className="flex justify-center items-center gap-x-2">
          <div className="rounded-full overflow-hidden mr-2">
            <img src="revenue.gif" alt="Calendar" className="h-9" />
          </div>
          <h1 className="text-3xl font-bold text-white">Monthly Revenue</h1>
        </div>

        <div className="flex items-center space-x-4">
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="MM/yyyy"
            showMonthYearPicker
            className="bg-[#e5e7eb] text-[#1f2937] px-2 py-2 rounded-lg"
            placeholderText="Select Month and Year"
          />
        </div>
      </div>

      {/* Total Revenue Section */}
      <div className="bg-stone-700 bg-opacity-80 text-white shadow-lg rounded-lg p-6 mb-6 flex justify-between items-center">
        <div className="left">
          <h2 className="text-2xl font-bold">Total Revenue</h2>
          <p className="text-4xl text-green-500 mt-2">
            ₹{totalRevenue.toLocaleString()}
          </p>
        </div>
        <div>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-600"
            onClick={handleAllCashExport}
          >
            <FaDownload className="w-5 h-5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Cash Revenue Section */}
      <div className="bg-stone-700 bg-opacity-80 text-white shadow-lg rounded-lg p-6 mb-6 flex justify-between items-center">
        <div className="left">
          <h2 className="text-2xl font-bold">Cash Revenue</h2>
          <p className="text-4xl text-green-500 mt-2">₹{cashRevenue.toLocaleString()}</p>
        </div>
        <div>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-600"
            onClick={handleCashExport}
          >
            <FaDownload className="w-5 h-5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Online Revenue Section */}
      <div className="bg-stone-700 bg-opacity-80 text-white shadow-lg rounded-lg p-6 mb-6 flex justify-between items-center">
        <div className="left">
          <h2 className="text-2xl font-bold">Online Revenue</h2>
          <p className="text-4xl text-blue-500 mt-2">₹{onlineRevenue.toLocaleString()}</p>
        </div>
        <div>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-600"
            onClick={handleOnlineExport}
          >
            <FaDownload className="w-5 h-5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Membership Revenue Section */}
      <div className="bg-stone-700 bg-opacity-70 text-white shadow-lg rounded-lg p-6 mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Membership Revenue</h2>
          <p className="text-4xl text-blue-500 mt-2">
            ₹{membershipRevenue.toLocaleString()}
          </p>
        </div>
        <div>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-600"
            onClick={handleAllCashExport}
          >
            <FaDownload className="w-5 h-5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Session Revenue Section */}
      <div className="bg-stone-700 bg-opacity-70 text-white shadow-lg rounded-lg p-6 mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">PT / Sessions Revenue</h2>
          <p className="text-4xl text-purple-500 mt-2">
            ₹{sessionRevenue.toLocaleString()}
          </p>
        </div>
        <div>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-600"
            onClick={handlePtExport}
          >
            <FaDownload className="w-5 h-5" />
            <span>Export</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RevenuePage;
