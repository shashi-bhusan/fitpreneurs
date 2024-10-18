import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Dialog, Transition } from "@headlessui/react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const List = ({ searchQuery, filter }) => {
  const [customers, setCustomers] = useState([]);
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const limit = 7;

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get("https://server.fitpreneursapiens.com/api/ptcustomer", {
          params: {
            search: searchQuery,
            filter: filter,
            page: page,
            limit: limit,
          },
        });
        setCustomers(response.data.customers);
        setTotalPages(Math.ceil(response.data.total / limit));
      } catch (error) {
        console.error("Error fetching customer data:", error);
        toast.error("Failed to fetch customers.");
      }
    };

    fetchCustomers();
  }, [searchQuery, filter, page]);

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

  // Reset the page to 1 whenever searchQuery or filter changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery, filter]);

  const handleRemoveSession = async (id) => {
    if (role !== "admin") {
      alert("You do not have permission to remove sessions");
      return;
    }

    if (!window.confirm("Are you sure you want to remove sessions for this customer?"))
      return;

    try {
      await axios.put(`https://server.fitpreneursapiens.com/api/customer/${id}`,{sessionType: "0 Sessions"});
      setCustomers(customers.filter((customer) => customer._id !== id));
      toast.success("Customer sessions removed successfully.");
    } catch (error) {
      console.error("Error removing customer sessions:", error);
      toast.error("Failed to remove customer sessions.");
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const openModal = (customer) => {
    setSelectedCustomer(customer);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedCustomer(null);
  };

  return (
    <div className="shadow-lg rounded-lg overflow-hidden min-h-full">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#574898] text-white">
            <tr>
              <th className="px-3 py-2 text-left text-base font-medium uppercase tracking-wider">
                Name
              </th>
              <th className="px-3 py-2 text-left text-base font-medium uppercase tracking-wider">
                Mobile No.
              </th>
              <th className="px-3 py-2 text-left text-base font-medium uppercase tracking-wider">
                Plan
              </th>
              <th className="px-3 py-2 text-left text-base font-medium uppercase tracking-wider">
                Sessions
              </th>
              <th className="px-3 py-2 text-left text-base font-medium uppercase tracking-wider">
                Address
              </th>
              <th className="px-3 py-2 text-center text-base font-medium uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-base font-normal bg-stone-700 bg-opacity-70 text-white">
            {customers.length > 0 ? (
              customers.map((customer) => (
                <tr key={customer._id}>
                  <td
                    onClick={() => openModal(customer)}
                    className="px-3 py-2 whitespace-nowrap capitalize cursor-pointer hover:bg-stone-900 hover:bg-opacity-50"
                  >
                    {customer.fullname}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {customer.mobileNumber}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {customer.plan}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {customer.sessionType}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap capitalize">
                    {customer.address}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap flex items-center justify-center">
                    <button
                      onClick={() => handleRemoveSession(customer._id)}
                      className="bg-red-600 text-white text-sm px-3 py-2 rounded-lg hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      title={`Remove Sessions For ${customer.fullname}`}
                    >
                      Remove Sessions
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
                  No customers found.
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

      {/* Modal */}
      <Transition appear show={isOpen} as={React.Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-stone-800 bg-opacity-40" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-full p-4 text-center">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-stone-800 bg-opacity-90 shadow-xl rounded-2xl">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-white flex flex-col justify-center items-center"
                  >
                    <p className="font-serif text-2xl font-bold">Client Details</p>
                    <div className="rounded-full overflow-hidden mt-3">
                      <img src="/gymmm.gif" alt="gif" className="h-36" />
                    </div>
                  </Dialog.Title>
                  <div className="mt-4 text-white">
                    {selectedCustomer && (
                      <div className="space-y-2">
                        <p className="capitalize">
                          <strong>Name:</strong> {selectedCustomer.fullname}
                        </p>
                        <p>
                          <strong>Mobile No.:</strong>{" "}
                          {selectedCustomer.mobileNumber}
                        </p>
                        <p>
                          <strong>Email ID:</strong> {selectedCustomer.emailId}
                        </p>
                        <p className="capitalize">
                          <strong>Address:</strong> {selectedCustomer.address}
                        </p>
                        <p>
                          <strong>Joined On:</strong>{" "}
                          {new Date(
                            selectedCustomer.createdAt
                          ).toLocaleDateString("en-GB")}
                        </p>
                        <p>
                          <strong>Membership Plan:</strong> {selectedCustomer.plan}
                        </p>
                        <p>
                          <strong>Membership Plan Cost:</strong> {selectedCustomer.planCost}
                        </p>
                        <p>
                          <strong>Session Type:</strong> {selectedCustomer.sessionType}
                        </p>
                        <p>
                          <strong>Session Cost:</strong> {selectedCustomer.sessionCost}
                        </p>
                        <p>
                          <strong>Total Cost:</strong> {selectedCustomer.totalAmount}
                        </p>
                        <p>
                          <strong>Paid Amount:</strong> {selectedCustomer.amountPaid}
                        </p>
                        <p>
                          <strong>Payment Mode:</strong> {selectedCustomer.paymentMode}
                        </p>
                        <p>
                          <strong>Debt:</strong> {selectedCustomer.debt}
                        </p>
                        <p>
                          <strong>Membership Start:</strong> {new Date(selectedCustomer.membershipStartDate).toLocaleDateString("en-GB")}
                        </p>
                        <p>
                          <strong>Membership End:</strong> {new Date(selectedCustomer.membershipEndDate).toLocaleDateString("en-GB")}
                        </p>
                        <p className="capitalize">
                          <strong>Status:</strong> {selectedCustomer.status}
                        </p>
            
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                      onClick={closeModal}
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default List;
