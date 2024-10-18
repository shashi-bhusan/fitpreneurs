import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Modal from "./Modal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EmployeeList = ({ searchQuery, filter }) => {
  const [employees, setEmployees] = useState([]);
  const [role, setRole] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployeeCustomers, setSelectedEmployeeCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [selectedEmployeeName, setSelectedEmployeeName] = useState("");
  const [page, setPage] = useState(1); // State for the current page
  const [totalPages, setTotalPages] = useState(1); // State for the total number of pages
  const limit = 7; // Items per page

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get("https://server.fitpreneursapiens.com/api/employee", {
          params: {
            search: searchQuery,
            filter: filter,
            page: page,
            limit: limit,
          },
        });
        setEmployees(response.data.employees);
        setTotalPages(Math.ceil(response.data.total / limit)); // Calculate total pages based on response
      } catch (error) {
        console.error("Error fetching employee data:", error);
        toast.error("Failed to fetch employees.");
      }
    };

    fetchEmployees();
  }, [searchQuery, filter, page]); // Include 'page' in the dependency array

  useEffect(() => {
    // Reset page to 1 whenever searchQuery or filter changes
    setPage(1);
  }, [searchQuery, filter]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setRole(decoded.role);
      } catch (error) {
        console.error("Invalid token:", error);
        setRole("");
      }
    }
  }, []);

  const handleDelete = async (id) => {
    if (role !== "admin") {
      alert("You do not have permission to delete employees.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this employee?"))
      return;

    try {
      await axios.delete(`https://server.fitpreneursapiens.com/api/employee/${id}`);
      setEmployees(employees.filter((employee) => employee._id !== id));
      toast.success("Employee deleted successfully.");
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast.error("Failed to delete employee.");
    }
  };

  const openModal = async (employee) => {
    setLoadingCustomers(true);
    setSelectedEmployeeName(employee.fullname);
    try {
      const response = await axios.get(
        `https://server.fitpreneursapiens.com/api/employee/${employee._id}/customers`
      );
      setSelectedEmployeeCustomers(response.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setSelectedEmployeeCustomers([]);
      } else {
        console.error("Error fetching customers:", error);
        toast.error("Failed to fetch customers.");
      }
    } finally {
      setIsModalOpen(true);
      setLoadingCustomers(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEmployeeCustomers([]);
    setSelectedCustomer(null);
    setSelectedEmployeeName("");
  };

  const handleCustomerSelect = (e) => {
    const customerId = e.target.value;
    const customer = selectedEmployeeCustomers.find(
      (cust) => cust._id === customerId
    );
    setSelectedCustomer(customer || null);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <div className="shadow-lg h-auto w-full">
      <div className="overflow-x-auto rounded-lg">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-[#574898] text-white">
            <tr>
              <th className="px-3 py-2 text-left text-base font-medium uppercase tracking-wider">
                Full Name
              </th>
              <th className="px-3 py-2 text-left text-base font-medium uppercase tracking-wider">
                Mobile No.
              </th>
              <th className="px-3 py-2 text-left text-base font-medium uppercase tracking-wider">
                Email ID
              </th>
              <th className="px-3 py-2 text-left text-base font-medium uppercase tracking-wider">
                Address
              </th>
              <th className="px-3 py-2 text-left text-base font-medium uppercase tracking-wider">
                Role
              </th>
              <th className="px-3 py-2 text-center text-base font-medium uppercase tracking-wider">
                Clients
              </th>
              <th className="px-3 py-2 text-center text-base font-medium uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-stone-700 bg-opacity-70 divide-y divide-gray-200 text-base font-normal text-white">
            {employees.length > 0 ? (
              employees.map((employee) => (
                <tr key={employee._id}>
                  <td className="px-3 py-2 whitespace-nowrap capitalize">
                    {employee.fullname}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {employee.mobileNumber}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {employee.emailId}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap capitalize">
                    {employee.address}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap capitalize">
                    {employee.role}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap flex items-center justify-center">
                    <button
                      className="bg-stone-600 text-white text-sm px-3 py-2 rounded-lg hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500"
                      onClick={() => openModal(employee)}
                    >
                      View Clients
                    </button>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <button
                      onClick={() => handleDelete(employee._id)}
                      className="bg-red-600 text-white text-sm px-3 py-2 rounded-lg hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      title={`Delete ${employee.fullname}`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="px-3 py-2 text-center text-base font-medium text-red-600"
                >
                  No employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className={`px-3 py-2 mx-1 rounded-lg text-white ${
            page === 1 ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-800"
          }`}
        >
          Previous
        </button>
        <span className="px-3 py-2 text-lg font-medium text-white">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          className={`px-3 py-2 mx-1 rounded-lg text-white ${
            page === totalPages
              ? "bg-gray-400"
              : "bg-blue-600 hover:bg-blue-800"
          }`}
        >
          Next
        </button>
      </div>

      
       {/* Modal for displaying employee's customers */}
       <Modal isOpen={isModalOpen} onClose={closeModal}>
        {loadingCustomers ? (
          <div className="flex justify-center items-center h-64">
            <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
          </div>
        ) : (
          <div className="px-4 py-3">
            <div className="flex flex-col justify-center items-center mb-4">
              <h1 className="text-white font-serif text-2xl text-center mb-3 font-semibold">
                <span className="capitalize">{selectedEmployeeName}</span>'s Client
              </h1>
              <div className="rounded-full overflow-hidden">
                <img
                  src="/gymmm.gif"
                  alt="gif"
                  className="h-36 w-36 object-cover"
                />
              </div>
            </div>
            <div className="space-y-3">
              <select
                onChange={handleCustomerSelect}
                className="w-full px-3 py-2 rounded bg-stone-800 bg-opacity-90 text-white focus:outline-none focus:ring-2 focus:ring-stone-500"
              >
                <option value="">Select a Customer</option>
                {selectedEmployeeCustomers.length > 0 ? (
                  selectedEmployeeCustomers.map((customer) => (
                    <option
                      key={customer._id}
                      value={customer._id}
                      className="capitalize text-white"
                    >
                      {customer.fullname}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No customers assigned.
                  </option>
                )}
              </select>

              {selectedCustomer && (
                <div className="mt-2 p-4 rounded-lg text-white space-y-2">
                  <p className="capitalize">
                    <strong>Full Name:</strong> {selectedCustomer.fullname}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedCustomer.emailId}
                  </p>
                  <p>
                    <strong>Mobile:</strong> {selectedCustomer.mobileNumber}
                  </p>
                  <p className="capitalize">
                    <strong>Address:</strong> {selectedCustomer.address}
                  </p>
                  <p>
                    <strong>Plan:</strong> {selectedCustomer.plan}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EmployeeList;
