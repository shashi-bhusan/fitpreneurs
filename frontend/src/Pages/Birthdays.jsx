import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";

const UpcomingBirthdays = () => {
  const [customersWithBirthdays, setCustomersWithBirthdays] = useState([]);

  useEffect(() => {
    fetchUpcomingBirthdays();
  }, []);

  const fetchUpcomingBirthdays = async () => {
    try {
      const response = await axios.get(
        "https://server.fitpreneursapiens.com/api/customer/upcoming-birthdays"
      );
      
      // Sort customers by nearest birthday
      const sortedCustomers = response.data.map((customer) => {
        const today = moment().startOf('day'); // Start of today's date
        const dob = moment(customer.dateOfBirth); // Customer's birthday
        const currentYearDob = dob.clone().year(today.year()); // Birthday this year

        // If the birthday has already passed this year, set it to next year
        if (currentYearDob.isBefore(today, 'day')) {
          currentYearDob.add(1, 'year');
        }

        // Calculate the number of days until the birthday
        const daysUntilBirthday = currentYearDob.diff(today, "days");

        // Attach the daysUntilBirthday to the customer object for sorting
        return { ...customer, daysUntilBirthday };
      })
      .sort((a, b) => a.daysUntilBirthday - b.daysUntilBirthday); // Sort by nearest birthday

      setCustomersWithBirthdays(sortedCustomers);
    } catch (error) {
      console.error("Error fetching upcoming birthdays", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="bg-gray-800 text-white w-full max-w-4xl rounded-lg shadow-lg p-6">
        <div className="flex flex-col justify-center items-center mb-8">
          <h1 className="text-white font-serif text-3xl mb-3 font-semibold">
            Upcoming Birthdays
          </h1>
          <div className="rounded-full overflow-hidden">
            <img src="/birthday.gif" alt="birthday" className="h-32" />
          </div>
        </div>

        {customersWithBirthdays.length > 0 ? (
          customersWithBirthdays.map((customer) => {
            const today = moment().startOf('day');
            const dob = moment(customer.dateOfBirth);
            const currentYearDob = dob.clone().year(today.year());

            // If the birthday has already passed this year, set it to next year
            if (currentYearDob.isBefore(today, 'day')) {
              currentYearDob.add(1, 'year');
            }

            const birthdayFormatted = currentYearDob.format("MMMM Do");
            const age = today.year() - dob.year(); // Calculate age
            const isToday = currentYearDob.isSame(today, 'day');
            const daysUntilBirthday = customer.daysUntilBirthday; // Already calculated for sorting

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
                      <strong>Birthday:</strong> {birthdayFormatted}
                    </p>
                    <p className="text-lg">
                      <strong>Turning:</strong> {age + 1} years old
                    </p>
                    <p className="text-yellow-500 text-xl font-bold mt-2">
                      🎂 {isToday ? "Today" : `Birthday in ${daysUntilBirthday} days`}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-lg">
            No upcoming birthdays within the next 7 days.
          </p>
        )}
      </div>
    </div>
  );
};

export default UpcomingBirthdays;
