import React, { Fragment, useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Dialog, Transition } from "@headlessui/react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";
import {
  ArrowUpCircleIcon,
  ChevronDoubleDownIcon,
  ChevronDoubleUpIcon,
  CurrencyBangladeshiIcon,
  CurrencyRupeeIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/20/solid";
import { useNavigate } from "react-router";
import { BASE_URL } from "../../utils/constants";
import { FaRecycle } from "react-icons/fa";

const List = ({ searchQuery, filter }) => {
  const [customers, setCustomers] = useState([]);
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPlanUpdateOpen, setIsPlanUpdateOpen] = useState(false);
  const [isPlanRenewOpen, setIsPlanRenewOpen] = useState(false);
  const [isFreezeOpen, setFreezeOpen] = useState(false);
  const [planDetails, setPlanDetails] = useState({
    plan: "",
    totalAmount: 0,
    mode: "cash",
    expiryDate: "",
    startDate: "",
    notes: "",
    planDays: 0,
  });

  const [freezeDetails, setFreezeDetails] = useState({
    totalAmount: "",
    mode: "cash",
    expiryDate: "",
    freezeDays: "",
    freezeDate: "",
    status: "",
    notes: "",
    paymentDate: ""
  });

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState(null);
  const [newPayment, setNewPayment] = useState({
    totalAmount: "",
    mode: "cash",
    notes: "",
    type: "other",
  });

  const navigate = useNavigate();

  const limit = 7;

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/customer`, {
          params: {
            search: searchQuery,
            filter: filter,
            page: page,
            limit: limit,
          },
        });
        setCustomers(response.data.customers);
        setTotalPages(Math.ceil(response.data.total / limit));
        console.log("customers:", customers);
      } catch (error) {
        console.error("Error fetching customer data:", error);
        toast.error("Failed to fetch customers.");
      }
    };

    fetchCustomers();
  }, [searchQuery, filter, page, isPaymentModalOpen]);

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

  const handleDelete = async (id) => {
    if (role !== "admin") {
      alert("You do not have permission to delete customers.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this customer?"))
      return;

    try {
      await axios.delete(`${BASE_URL}/customer/${id}`);
      setCustomers(customers.filter((customer) => customer._id !== id));
      toast.success("Customer deleted successfully.");
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast.error("Failed to delete customer.");
    }
  };

  function truncate(text) {
    if (text.length > 15) {
      return text.slice(0, 12) + '...';
    }
    return text;
  }

  // Add function to handle opening payment modal
  const openPaymentModal = async (customer) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/customer/${customer._id}/payments`
      );
      setPaymentHistory(response.data);
      setSelectedCustomer(customer);
      setIsPaymentModalOpen(true);
    } catch (error) {
      console.error("Error fetching payment history:", error);
      toast.error("Failed to fetch payment history");
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {

      await axios.post(
        `${BASE_URL}/customer/${selectedCustomer._id}/payments`,
        { ...newPayment }
      );

      // Refresh payment history
      const response = await axios.get(
        `${BASE_URL}/customer/${selectedCustomer._id}/payments`
      );
      setPaymentHistory(response.data);

      // Reset form
      setNewPayment({
        totalAmount: "",
        mode: "cash",
        notes: "",
        type: "other",
      });
      setIsPaymentModalOpen(false);
      toast.success("Payment added successfully");
    } catch (error) {
      console.error("Error adding payment:", error);
      toast.error("Failed to add payment");
    }
  };

  const updatePlan = async () => {
    if (!selectedCustomer || !planDetails.plan) {
      toast.error("Please select a plan");
      return;
    }
    console.log("selectedCustomer:", selectedCustomer);

    try {
      const response = await axios.put(
        `${BASE_URL}/customer/upgrade/${selectedCustomer._id}`,
        {
          ...planDetails,
        }
      );

      // Update the customers list with the new data
      setCustomers(
        customers.map((customer) =>
          customer._id === selectedCustomer._id
            ? { ...customer, ...response.data }
            : customer
        )
      );
      console.log("plan details:", planDetails);

      toast.success("Plan updated successfully");
      closePlanUpdateModal();
    } catch (error) {
      console.error("Error updating plan:", error);
      toast.error(error.response?.data?.message || "Failed to update plan");
    }
  };

  const handleUpdate = async (id) => {
    if (role !== "admin") {
      alert("You do not have permission to edit customers.");
      return;
    }
    navigate(`/customers/${id}`);
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

  const openPlanUpdateModal = async (customer) => {
    try {
      const response = await axios.get(`${BASE_URL}/customer/${customer._id}`);
      const customerData = response.data;

      setPlanDetails({
        plan: "",
        totalAmount: 0,
        mode: "cash",
        expiryDate: "",
        startDate: "",
        notes: "",
        planDays: 0,
      });
      setSelectedCustomer(customerData);
      setIsPlanUpdateOpen(true);
    } catch (error) {
      console.error("Error fetching customer details:", error);
      toast.error("Failed to fetch customer details");
    }
  };
  const closePlanUpdateModal = () => {
    setIsPlanUpdateOpen(false);
    setSelectedCustomer(null);
  };

  const openPlanRenewModal = async (customer) => {
    try {
      const response = await axios.get(`${BASE_URL}/customer/${customer._id}`);
      const customerData = response.data;

      setPlanDetails({
        plan: "",
        totalAmount: 0,
        mode: "cash",
        expiryDate: "",
        startDate: "",
        notes: "",
        planDays: 0,
      });
      setSelectedCustomer(customerData);
      setIsPlanRenewOpen(true);
    } catch (error) {
      console.error("Error fetching customer details:", error);
      toast.error("Failed to fetch customer details");
    }
  };
  const closePlanRenewModal = () => {
    setIsPlanRenewOpen(false);
    setSelectedCustomer(null);
  };

  const renewPlan = async () => {
    if (!selectedCustomer || !planDetails.plan) {
      toast.error("Please select a plan");
      return;
    }
    console.log("selectedCustomer:", selectedCustomer);

    try {
      const response = await axios.put(
        `${BASE_URL}/customer/renew/${selectedCustomer._id}`,
        {
          ...planDetails,
        }
      );

      // Update the customers list with the new data
      setCustomers(
        customers.map((customer) =>
          customer._id === selectedCustomer._id
            ? { ...customer, ...response.data }
            : customer
        )
      );
      console.log("plan details:", planDetails);

      toast.success("Plan updated successfully");
      closePlanRenewModal();
    } catch (error) {
      console.error("Error updating plan:", error);
      toast.error(error.response?.data?.message || "Failed to update plan");
    }
  };

  const openFreezeModal = async (customer) => {
    try {
      const response = await axios.get(`${BASE_URL}/customer/${customer._id}`);
      const customerData = response.data;

      setFreezeDetails({
        totalAmount: "",
        mode: "cash",
        expiryDate: "",
        freezeDays: "",
        freezeDate: "",
        status: "",
        notes: "",
        paymentDate: "",
      });
      setSelectedCustomer(customerData);
      setFreezeOpen(true);
    } catch (error) {
      console.error("Error fetching customer details:", error);
      toast.error("Failed to fetch customer details");
    }
  };
  const closeFreezeModal = () => {
    setFreezeOpen(false);
    setSelectedCustomer(null);
  };

  const updateStatus = async () => {
    if (!selectedCustomer || !freezeDetails.status) {
      toast.error("Please select a status");
      return;
    }
    console.log("selectedCustomer:", selectedCustomer);

    try {
      const response = await axios.put(
        `${BASE_URL}/customer/status/${selectedCustomer._id}`,
        {
          ...freezeDetails,
        }
      );

      // Update the customers list with the new data
      setCustomers(
        customers.map((customer) =>
          customer._id === selectedCustomer._id
            ? { ...customer, ...response.data }
            : customer
        )
      );
      console.log("plan details:", planDetails);

      toast.success("Status updated successfully");
      closeFreezeModal();
    } catch (error) {
      console.error("Error updating plan:", error);
      toast.error(error.response?.data?.message || "Failed to update plan");
    }
  };

  return (
    <div className="shadow-lg rounded-lg overflow-hidden min-h-full">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#574898] text-white">
            <tr>
              <th></th>
              <th className="px-3 py-2 text-left text-base font-medium uppercase tracking-wider">
                Name
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
                Plan
              </th>
              <th className="px-3 py-2 text-left text-base font-medium uppercase tracking-wider">
                Expires In
              </th>
              <th className="px-3 py-2 text-left text-base font-medium uppercase tracking-wider">
                Debt
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
                    onClick={() => openFreezeModal(customer)}
                    className="px-3 py-2 cursor-pointer whitespace-nowrap"
                  >
                    {customer.status === "active"
                      ? "🟢"
                      : customer.status === "inactive"
                      ? "🔴"
                      : customer.status === "freeze"
                      ? "🟡"
                      : null}
                  </td>
                  <td
                    onClick={() => openModal(customer)}
                    className="px-3 py-2 whitespace-nowrap capitalize cursor-pointer hover:bg-stone-900 hover:bg-opacity-50"
                    title={`Show details of ${customer.fullname}`}
                  >
                    {customer.fullname}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {customer.mobileNumber}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    {customer.emailId}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap capitalize">
                    {truncate(customer.address)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {customer.plan}
                    {customer.plan != "Per Day" &&
                      customer.plan != "12 months" &&
                      !moment(customer.membershipEndDate).isBefore(
                        moment()
                      ) && (
                        <button
                          onClick={() => openPlanUpdateModal(customer)}
                          className="ml-2  text-white "
                          title="Upgrade Plan"
                        >
                          <ChevronDoubleUpIcon className="relative top-1 h-6 bg-[#1E88E5] rounded-full hover:bg-[#2b6ca5]  " />
                        </button>
                      )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {moment(customer.membershipEndDate).isBefore(moment()) ? (
                      <>
                        Expired{" "}
                        <button
                          onClick={() => openPlanRenewModal(customer)}
                          className="ml-2  text-white "
                          title="Upgrade Plan"
                        >
                          <FaRecycle className="relative top-1 h-6 bg-[#1E88E5] rounded-full hover:bg-[#2b6ca5]  " />
                        </button>
                      </>
                    ) : (
                      `${moment(customer.membershipEndDate).diff(
                        moment(),
                        "days"
                      )} days`
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {customer.debt}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap flex gap-1 items-center justify-center">
                    <button
                      onClick={() => openPaymentModal(customer)}
                      className="bg-green-500 text-white text-sm px-2 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      title={`View payments for ${customer.fullname}`}
                    >
                      <CurrencyRupeeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleUpdate(customer._id)}
                      className="bg-[#1E88E5] text-white text-sm px-2 py-2 rounded-lg hover:bg-[#2b6ca5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      title={`Edit ${customer.fullname}`}
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(customer._id)}
                      className="bg-red-600 text-white text-sm px-2 py-2 rounded-lg hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      title={`Delete ${customer.fullname}`}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="8"
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
                    <p className="font-serif text-2xl font-bold">
                      Client Details
                    </p>
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
                        <p>
                          <strong>DOB:</strong>{" "}
                          {new Date(
                            selectedCustomer.dateOfBirth
                          ).toLocaleDateString()}
                        </p>
                        <p className="capitalize">
                          <strong>Address:</strong> {selectedCustomer.address}
                        </p>
                        {/* <p>
                          <strong>Joined On:</strong>{" "}
                          {new Date(
                            selectedCustomer.createdAt
                          ).toLocaleDateString("en-GB")}
                        </p> */}
                        <p>
                          <strong>Membership Plan:</strong>{" "}
                          {selectedCustomer.plan}
                        </p>

                        {selectedCustomer.plan === "Per Day" && (
                          <p>
                            <strong>Membership Plan Days:</strong>{" "}
                            {selectedCustomer.planDays} days
                          </p>
                        )}

                        <p>
                          <strong>Membership Plan Cost:</strong>{" "}
                          {selectedCustomer.planCost}
                        </p>
                        <p>
                          <strong>Session Type:</strong>{" "}
                          {selectedCustomer.sessionType}
                        </p>
                        <p>
                          <strong>Session Cost:</strong>{" "}
                          {selectedCustomer.sessionCost}
                        </p>
                        <p>
                          <strong>Total Cost:</strong>{" "}
                          {selectedCustomer.totalAmount}
                        </p>
                        <p>
                          <strong>Paid Amount:</strong>{" "}
                          {selectedCustomer.amountPaid}
                        </p>
                        <p>
                          <strong>Payment Mode:</strong>{" "}
                          {selectedCustomer.paymentMode}
                        </p>
                        <p>
                          <strong>Debt:</strong> {selectedCustomer.debt}
                        </p>
                        <p>
                          <strong>Membership Start:</strong>{" "}
                          {new Date(
                            selectedCustomer.membershipStartDate
                          ).toLocaleDateString("en-GB")}
                        </p>
                        <p>
                          <strong>Membership End:</strong>{" "}
                          {new Date(
                            selectedCustomer.membershipEndDate
                          ).toLocaleDateString("en-GB")}
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

      {/* Plan Update Modal */}
      <Transition appear show={isPlanUpdateOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10 "
          onClose={closePlanUpdateModal}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-stone-800 bg-opacity-45 " />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-stone-800 text-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Update Plan Details
                  </Dialog.Title>
                  <div className="mt-4 space-y-4 bg-stone-700 p-4 rounded-lg">
                    <h4 className="text-lg font-medium text-white mb-3">
                      Current Details
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-300">Current Plan</p>
                        <p className="font-medium">
                          {selectedCustomer?.plan || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-300">Start Date</p>
                        <p className="font-medium">
                          {selectedCustomer?.membershipStartDate
                            ? moment(
                                selectedCustomer.membershipStartDate
                              ).format("DD MMM YYYY")
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-300">Expiry Date</p>
                        <p className="font-medium">
                          {selectedCustomer?.membershipEndDate
                            ? moment(selectedCustomer.membershipEndDate).format(
                                "DD MMM YYYY"
                              )
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-300">Days Remaining</p>
                        <p className="font-medium">
                          {selectedCustomer?.membershipEndDate
                            ? `${moment(
                                selectedCustomer.membershipEndDate
                              ).diff(moment(), "days")} days`
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-300">Current Debt</p>
                        <p className="font-medium text-red-400">
                          ₹{selectedCustomer?.debt || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Select Plan
                        </label>
                        <select
                          value={planDetails.plan}
                          onChange={(e) =>
                            setPlanDetails({
                              ...planDetails,
                              plan: e.target.value,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black p-2"
                        >
                          <option value="" disabled>
                            Select a plan
                          </option>
                          {[
                            "Per Day",
                            "1 month",
                            "3 months",
                            "6 months",
                            "12 months",
                          ].map((plan) => {
                            // Only show plans that are "greater" than the current plan
                            const currentPlanIndex = [
                              "Per Day",
                              "1 month",
                              "3 months",
                              "6 months",
                              "12 months",
                            ].indexOf(selectedCustomer?.plan);
                            const planIndex = [
                              "Per Day",
                              "1 month",
                              "3 months",
                              "6 months",
                              "12 months",
                            ].indexOf(plan);

                            return (
                              planIndex > currentPlanIndex && (
                                <option key={plan} value={plan}>
                                  {plan}
                                </option>
                              )
                            );
                          })}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 ">
                          New Expiry Date
                        </label>
                        <input
                          type="date"
                          required
                          onChange={(e) =>
                            setPlanDetails({
                              ...planDetails,
                              expiryDate: e.target.value,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black p-2"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 ">
                          Total Amount
                        </label>
                        <input
                          type="number"
                          required
                          onChange={(e) =>
                            setPlanDetails({
                              ...planDetails,
                              totalAmount: e.target.value,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black p-2"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Payment mode
                        </label>

                        <select
                          value={planDetails.mode}
                          onChange={(e) =>
                            setPlanDetails({
                              ...planDetails,
                              mode: e.target.value,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black p-2"
                        >
                          <option value="" disabled>
                            Select a mode
                          </option>
                          <option value="cash">cash</option>
                          <option value="online">online</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Notes
                        </label>

                        <input
                          type="text"
                          onChange={(e) =>
                            setPlanDetails({
                              ...planDetails,
                              notes: e.target.value,
                            })
                          }
                          value={planDetails.notes}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black p-2"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
                      onClick={closePlanUpdateModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={updatePlan}
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                    >
                      Update Plan
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Payment Modal */}
      <Transition appear show={isPaymentModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsPaymentModalOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-stone-800 bg-opacity-45" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 py-2 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-stone-800 text-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 mb-3"
                  >
                    Payment History
                  </Dialog.Title>

                  {paymentHistory && (
                    <div className="space-y-4">
                      <div className="bg-stone-700 p-4 py-3 rounded-lg">
                        <p className="text-lg font-semibold">
                          {paymentHistory.customerName}
                        </p>
                        <p>Total Amount: ₹{paymentHistory.totalAmount}</p>
                        <p className="text-red-400">
                          Remaining Balance: ₹{paymentHistory.debt}
                        </p>
                      </div>

                      <div className="max-h-[9rem] overflow-y-auto">
                        <table className="min-w-full">
                          <thead className="bg-stone-900">
                            <tr>
                              <th className="px-4 py-2">Date</th>
                              <th className="px-4 py-2">Amount</th>
                              <th className="px-4 py-2">Mode</th>
                              <th className="px-4 py-2">Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paymentHistory.payments.map((payment, index) => (
                              <tr
                                key={index}
                                className="border-t border-stone-700"
                              >
                                <td className="px-4 py-2">
                                  {moment(payment.date).format("DD/MM/YYYY")}
                                </td>
                                <td className="px-4 py-2">₹{payment.amount}</td>
                                <td className="px-4 py-2 capitalize">
                                  {payment.mode}
                                </td>
                                <td className="px-4 py-2">{payment.notes}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <form
                        onSubmit={handlePaymentSubmit}
                        className="space-y-4 mt-4 pt-4 border-t border-stone-700"
                      >
                        <h4 className="font-medium">Add New Payment</h4>

                        <div className="grid  gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Amount
                            </label>
                            <input
                              type="number"
                              value={newPayment.amount}
                              onChange={(e) =>
                                setNewPayment({
                                  ...newPayment,
                                  totalAmount: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 rounded bg-stone-700 border border-stone-600"
                              required
                            />
                          </div>

                          {/* <div>
                            <label className="block text-sm font-medium mb-1">
                              Payment Date (Optional)
                            </label>
                            <input
                              type="date"
                              value={newPayment.date}
                              onChange={(e) =>
                                setNewPayment({
                                  ...newPayment,
                                  date: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 rounded bg-stone-700 border border-stone-600 text-white"
                              max={new Date().toISOString().split("T")[0]} // Prevent future dates
                            />
                            <span className="text-xs text-gray-400 mt-1">
                              Leave empty for current date
                            </span>
                          </div> */}
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Payment Mode
                          </label>
                          <select
                            value={newPayment.mode}
                            onChange={(e) =>
                              setNewPayment({
                                ...newPayment,
                                mode: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 rounded bg-stone-700 border border-stone-600"
                            required
                          >
                            <option value="cash">Cash</option>
                            <option value="online">Online</option>
                            <option value="upi">UPI</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Payment Type
                          </label>
                          <select
                            value={newPayment.type}
                            onChange={(e) =>
                              setNewPayment({
                                ...newPayment,
                                type: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 rounded bg-stone-700 border border-stone-600"
                            required
                          >
                            <option value="other">Other</option>
                            <option value="debt">Debt</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Notes
                          </label>
                          <input
                            type="text"
                            value={newPayment.notes}
                            onChange={(e) =>
                              setNewPayment({
                                ...newPayment,
                                notes: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 rounded bg-stone-700 border border-stone-600"
                          />
                        </div>

                        <div className="flex justify-end space-x-3 mt-4">
                          <button
                            type="button"
                            onClick={() => setIsPaymentModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-white bg-stone-600 rounded-md hover:bg-stone-500"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-[#1e88e5] rounded-md hover:bg-blue-500"
                          >
                            Add Payment
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Plan Renew Modal */}
      <Transition appear show={isPlanRenewOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10 "
          onClose={closePlanRenewModal}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-stone-800 bg-opacity-45 " />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-stone-800 text-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Renew Plan
                  </Dialog.Title>
                  <div className="mt-4 space-y-4 bg-stone-700 p-4 rounded-lg">
                    <h4 className="text-lg font-medium text-white mb-3">
                      Current Details
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-300">Last Plan</p>
                        <p className="font-medium">
                          {selectedCustomer?.plan || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-300">Start Date</p>
                        <p className="font-medium">
                          {selectedCustomer?.membershipStartDate
                            ? moment(
                                selectedCustomer.membershipStartDate
                              ).format("DD MMM YYYY")
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-300">Expiry Date</p>
                        <p className="font-medium">
                          {selectedCustomer?.membershipEndDate
                            ? moment(selectedCustomer.membershipEndDate).format(
                                "DD MMM YYYY"
                              )
                            : "N/A"}
                        </p>
                      </div>
                      {/* <div>
                        <p className="text-gray-300">Days Remaining</p>
                        <p className="font-medium">
                          {selectedCustomer?.membershipEndDate
                            ? `${moment(
                                selectedCustomer.membershipEndDate
                              ).diff(moment(), "days")} days`
                            : "N/A"}
                        </p>
                      </div> */}
                      <div>
                        <p className="text-gray-300">Current Debt</p>
                        <p className="font-medium text-red-400">
                          ₹{selectedCustomer?.debt || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Select Plan
                        </label>
                        <select
                          value={planDetails.plan}
                          onChange={(e) =>
                            setPlanDetails({
                              ...planDetails,
                              plan: e.target.value,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black p-2"
                        >
                          <option value="" disabled>
                            Select a plan
                          </option>
                          {[
                            "Per Day",
                            "1 month",
                            "3 months",
                            "6 months",
                            "12 months",
                          ].map((plan) => {
                            return (
                              <option key={plan} value={plan}>
                                {plan}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      {planDetails.plan === "Per Day" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Plan Days
                          </label>
                          <input
                            type="number"
                            required
                            value={planDetails.planDays}
                            onChange={(e) =>
                              setPlanDetails({
                                ...planDetails,
                                planDays: e.target.value,
                              })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black p-2"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 ">
                          Start Date
                        </label>
                        <input
                          type="date"
                          required
                          onChange={(e) =>
                            setPlanDetails({
                              ...planDetails,
                              startDate: e.target.value,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black p-2"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 ">
                          Total Amount
                        </label>
                        <input
                          type="number"
                          required
                          onChange={(e) =>
                            setPlanDetails({
                              ...planDetails,
                              totalAmount: e.target.value,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black p-2"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Payment mode
                        </label>

                        <select
                          value={planDetails.mode}
                          onChange={(e) =>
                            setPlanDetails({
                              ...planDetails,
                              mode: e.target.value,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black p-2"
                        >
                          <option value="" disabled>
                            Select a mode
                          </option>
                          <option value="cash">cash</option>
                          <option value="online">online</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Notes
                        </label>

                        <input
                          type="text"
                          onChange={(e) =>
                            setPlanDetails({
                              ...planDetails,
                              notes: e.target.value,
                            })
                          }
                          value={planDetails.notes}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black p-2"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
                      onClick={closePlanRenewModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={renewPlan}
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                    >
                      Renew Plan
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Freeze Modal */}
      <Transition appear show={isFreezeOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10 " onClose={closeFreezeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-stone-800 bg-opacity-45 " />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-stone-800 text-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Update Status
                  </Dialog.Title>
                  <div className="mt-4 space-y-4 bg-stone-700 p-4 rounded-lg">
                    <h4 className="text-lg font-medium text-white mb-3">
                      Current Details
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-300">Current Plan</p>
                        <p className="font-medium">
                          {selectedCustomer?.plan || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-300">Start Date</p>
                        <p className="font-medium">
                          {selectedCustomer?.membershipStartDate
                            ? moment(
                                selectedCustomer.membershipStartDate
                              ).format("DD MMM YYYY")
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-300">Expiry Date</p>
                        <p className="font-medium">
                          {selectedCustomer?.membershipEndDate
                            ? moment(selectedCustomer.membershipEndDate).format(
                                "DD MMM YYYY"
                              )
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-300">Days Remaining</p>
                        <p className="font-medium">
                          {selectedCustomer?.membershipEndDate
                            ? `${moment(
                                selectedCustomer.membershipEndDate
                              ).diff(moment(), "days")} days`
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-300">Current Debt</p>
                        <p className="font-medium text-red-400">
                          ₹{selectedCustomer?.debt || 0}
                        </p>
                      </div>
                      {selectedCustomer?.freezeDays > 0 && (
                        <div>
                          <p className="text-gray-300">Freeze Days</p>
                          <p className="font-medium text-red-400">
                            {selectedCustomer?.freezeDays || 0}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Select Status
                        </label>
                        <select
                          value={freezeDetails.status}
                          onChange={(e) =>
                            setFreezeDetails({
                              ...freezeDetails,
                              status: e.target.value,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black p-2"
                        >
                          <option value="" disabled>
                            Select a status
                          </option>
                          {selectedCustomer?.status === "active" ? (
                            <option value="freeze">Freeze</option>
                          ) : (
                            <option value="unfreeze">Unfreeze</option>
                          )}
                        </select>
                      </div>

                      {freezeDetails.status === "freeze" && (
                        <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Freeze Days
                          </label>
                          <input
                            type="number"
                            required
                            value={freezeDetails.freezeDays}
                            onChange={(e) =>
                              setFreezeDetails({
                                ...freezeDetails,
                                freezeDays: e.target.value,
                              })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black p-2"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 ">
                            Freeze Date
                          </label>
                          <input
                            type="date"
                            required
                            onChange={(e) =>
                              setFreezeDetails({
                                ...freezeDetails,
                                freezeDate: e.target.value,
                              })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black p-2"
                          />
                        </div>

                        </>
                      )}

                      {freezeDetails.status === "unfreeze" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 ">
                            New Expiry Date
                          </label>
                          <input
                            type="date"
                            required
                            onChange={(e) =>
                              setFreezeDetails({
                                ...freezeDetails,
                                expiryDate: e.target.value,
                              })
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black p-2"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 ">
                          Total Amount
                        </label>
                        <input
                          type="number"
                          required
                          onChange={(e) =>
                            setFreezeDetails({
                              ...freezeDetails,
                              totalAmount: e.target.value,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black p-2"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Payment mode
                        </label>

                        <select
                          value={planDetails.mode}
                          onChange={(e) =>
                            setFreezeDetails({
                              ...freezeDetails,
                              mode: e.target.value,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black p-2"
                        >
                          <option value="" disabled>
                            Select a mode
                          </option>
                          <option value="cash">cash</option>
                          <option value="online">online</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Payment Date
                        </label>

                        <input
                          type="date"
                          onChange={(e) =>
                            setFreezeDetails({
                              ...freezeDetails,
                              paymentDate: e.target.value,
                            })
                          }
                          value={freezeDetails.notes}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black p-2"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Notes
                        </label>

                        <input
                          type="text"
                          onChange={(e) =>
                            setFreezeDetails({
                              ...freezeDetails,
                              notes: e.target.value,
                            })
                          }
                          value={freezeDetails.notes}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black p-2"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
                      onClick={closeFreezeModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={updateStatus}
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                    >
                      Update Status
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
