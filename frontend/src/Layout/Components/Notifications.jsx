import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import moment from 'moment';

function Notifications() {
  const [expiringCustomers, setExpiringCustomers] = useState([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const panelRef = useRef(null); // Reference for the notification panel

  useEffect(() => {
    fetchExpiringCustomers();

    // Load unread status from local storage
    const storedCustomers = JSON.parse(
      localStorage.getItem('expiringCustomers')
    );
    if (storedCustomers) {
      setExpiringCustomers(storedCustomers);
    }

    // Event listener to close the panel on clicking outside
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsPanelOpen(false); // Close the panel if clicked outside
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchExpiringCustomers = async () => {
    try {
      const response = await axios.get(
        'https://server.fitpreneursapiens.com/api/customer/expiring-memberships'
      );

      const customers = response.data.filter((customer) => {
        const daysLeft = moment(customer.membershipEndDate).diff(
          moment(),
          'days'
        );
        return daysLeft <= 10 && daysLeft >= 0; // Memberships expiring within 10 days
      });

      // Store the fetched customers in local storage
      localStorage.setItem('expiringCustomers', JSON.stringify(customers));
      setExpiringCustomers(customers);
    } catch (error) {
      console.error('Error fetching expiring memberships', error);
    }
  };

  const toggleNotificationPanel = () => {
    setIsPanelOpen(!isPanelOpen); // Toggle panel
    if (!isPanelOpen) {
      markAllAsRead(); // Mark all as read when opening the panel
    }
  };

  const markAllAsRead = () => {
    const updatedCustomers = expiringCustomers.map((customer) => ({
      ...customer,
      read: true, // Mark each customer as read
    }));
    setExpiringCustomers(updatedCustomers);
    localStorage.setItem('expiringCustomers', JSON.stringify(updatedCustomers)); // Update local storage
  };

  return (
    <div className="relative">
      {/* Notification Icon */}
      <button className="relative" onClick={toggleNotificationPanel}>
        <img src="/notification.svg" className="w-7 h-7" alt="Notifications" />
        {expiringCustomers.some((customer) => !customer.read) && (
          <span
            className={`w-2 h-2 bg-[#F30000]   absolute rounded-full right-0 top-0`}
          ></span>
        )}
      </button>

      {/* Notification Panel */}
      {isPanelOpen && (
        <div
          ref={panelRef} // Attach ref to the panel
          className={`absolute w-[20rem] h-[20rem] bg-stone-800 text-stone-200 z-50 right-0 rounded-lg overflow-y-scroll no-scrollbar`}
        >
          {expiringCustomers.length > 0 ? (
            expiringCustomers.map((customer, index) => {
              const today = new Date();
              const membershipEndDate = new Date(customer.membershipEndDate);
              const diffTime = membershipEndDate - today; // Time difference in milliseconds
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert to days

              return (
                <div
                  key={customer._id}
                  className={`w-full border-b-[1px] h-[4rem] flex items-center justify-between px-4 gap-3 relative cursor-pointer ${
                    customer.read ? 'bg-stone-700' : 'bg-stone-800'
                  }`}
                  onClick={() => {
                    markAsRead(index);
                  }}
                >
                  <img
                    src="/warning.gif"
                    alt="warning"
                    className="h-8 rounded-full"
                  />
                  <span>
                    {customer.fullname}'s membership ends in {diffDays} day
                    {diffDays !== 1 ? 's' : ''}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span>No Notifications</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Notifications;
