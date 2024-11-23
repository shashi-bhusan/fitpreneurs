import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import axios from "axios";
import config from "../../config/config";

const ClientDetails = () => {
  const { state: clientData } = useLocation();
  const [employeeNames, setEmployeeNames] = useState([]);

  useEffect(() => {
    const fetchEmployeeNames = async () => {
      try {
        const employeeNamesArray = await Promise.all(
          clientData.assignedEmployees.map(async (employeeId) => {
            const response = await axios.get(`${config.apiBaseUrl}/employee/${employeeId}`);
            return response.data.fullname;
          })
        );
        setEmployeeNames(employeeNamesArray);
      } catch (error) {
        console.error("Error fetching employee names:", error);
      }
    };

    if (clientData.assignedEmployees.length > 0) {
      fetchEmployeeNames();
    }
  }, [clientData.assignedEmployees]);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Client Information", 14, 22);

    doc.setFontSize(12);
    const tableColumn = ["Field", "Details"];
    const tableRows = [];

    tableRows.push(["Name", clientData.fullname]);
    tableRows.push(["Email", clientData.emailId]);
    tableRows.push(["Mobile Number", clientData.mobileNumber]);
    tableRows.push(["Address", clientData.address]);
    tableRows.push([
      "Personal Trainers",
      employeeNames.length > 0 ? employeeNames.join(", ") : "None",
    ]);
    tableRows.push(["Membership Plan", clientData.plan]);

    if(clientData.plan == "Per Day"){
      tableRows.push(["Membership Plan Days", clientData.planDays]);
    }

    tableRows.push(["Membership Plan Cost", `${clientData.planCost}/-`]);
    tableRows.push(["Session Type", clientData.sessionType]);
    tableRows.push(["Session Cost", `${clientData.sessionCost}/-`]);
    tableRows.push(["Total Amount", `${clientData.totalAmount}/-`]);
    tableRows.push(["Amount Paid", `${clientData.amountPaid}/-`]);
    tableRows.push(["Debt", `${clientData.debt}/-`]);
    tableRows.push([
      "Membership Start Date",
      formatDate(clientData.membershipStartDate),
    ]);
    tableRows.push([
      "Membership End Date",
      formatDate(clientData.membershipEndDate),
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });

    doc.save(`${clientData.fullname}_details.pdf`);
  };

  return (
    <div className="p-4 text-white text-lg bg-gray-800 rounded-md shadow-lg">
      <div className="flex flex-col justify-center items-center w-auto bg-stone-700 bg-opacity-70 p-3">
        <h2 className="font-bold text-3xl mb-5">Client Details</h2>
        <div className="mb-4">
          <p>
            <strong>Name:</strong> {clientData.fullname}
          </p>
          <p>
            <strong>Email:</strong> {clientData.emailId}
          </p>
          <p>
            <strong>Mobile Number:</strong> {clientData.mobileNumber}
          </p>
          <p>
            <strong>Address:</strong> {clientData.address}
          </p>
          <p>
            <strong>Personal Trainers:</strong>{" "}
            {employeeNames.length > 0 ? employeeNames.join(", ") : "None"}
          </p>
          <p>
            <strong>Membership Plan:</strong> {clientData.plan}
          </p>
          {clientData.plan == "Per Day" && (
            <p>
              <strong>Membership Plan Days:</strong> {clientData.planDays}
            </p>
          )}
          <p>
            <strong>Membership Plan Cost:</strong> ₹{clientData.planCost}
          </p>
          <p>
            <strong>Session Type:</strong> {clientData.sessionType}
          </p>
          <p>
            <strong>Session Cost:</strong> ₹{clientData.sessionCost}
          </p>
          <p>
            <strong>Total Amount:</strong> ₹{clientData.totalAmount}
          </p>
          <p>
            <strong>Amount Paid:</strong> ₹{clientData.amountPaid}
          </p>
          {/* <p>
            <strong>Payment Mode:</strong> ₹{clientData.paymentMode}
          </p> */}
          <p>
            <strong>Debt:</strong> ₹{clientData.debt}
          </p>
          <p>
            <strong>Last Payment Date:</strong>{" "}
            {formatDate(clientData.payments[0]?.date)}
          </p>
          <p>
            <strong>Membership Start Date:</strong>{" "}
            {formatDate(clientData.membershipStartDate)}
          </p>
          <p>
            <strong>Membership End Date:</strong>{" "}
            {formatDate(clientData.membershipEndDate)}
          </p>
        </div>
        <button onClick={downloadPDF} className="btn btn-primary mt-4">
          Download as PDF
        </button>
      </div>
    </div>
  );
};

export default ClientDetails;
