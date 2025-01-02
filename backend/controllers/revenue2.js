const Customer = require("../models/customer");
const moment = require("moment");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

// Get total amount collected by payment mode for the current month
exports.getMonthlyRevenueByPaymentMode = async (req, res) => {
  try {
    const startOfMonth = moment().startOf('month').toDate();
    const endOfMonth = moment().endOf('month').toDate();

    // Aggregate for cash and card payments
    const revenueData = await Customer.aggregate([
      {
        $match: {
          paymentMode: { $in: ["cash", "card"] },
          updatedAt: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: "$paymentMode",
          totalCollected: { $sum: "$amountPaid" },
        },
      },
    ]);

    const cashRevenue = revenueData.find((data) => data._id === "cash")?.totalCollected || 0;
    const cardRevenue = revenueData.find((data) => data._id === "card")?.totalCollected || 0;

    res.status(200).json({
      cashRevenue,
      cardRevenue,
    });
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    res.status(500).json({ message: "Error fetching revenue data" });
  }
};

exports.getMonthlyRevenue = async (req, res) => {
  try {
    const { year, month } = req.query;
    const startDate = new Date(year, month - 1, 1); // Start of the given month
    const endDate = new Date(year, month, 0, 23, 59, 59, 999); // End of the given month

    const revenue = await Customer.aggregate([
      { 
        $unwind: "$payments" 
      },
      {
        $match: {
          "payments.date": { $gte: startDate, $lte: endDate } 
        },
      },
      {
        $group: {
          _id: null, // Group all data together
          totalRevenue: { $sum: "$payments.amount" },
          cashRevenue: {
            $sum: { $cond: [{ $eq: ["$payments.mode", "cash"] }, "$payments.amount", 0] }
          },
          cardUpiRevenue: {
            $sum: {
              $cond: [
                { $or: [{ $eq: ["$payments.mode", "card"] }, { $eq: ["$payments.mode", "upi"] }] },
                "$payments.amount",
                0,
              ],
            },
          },
          membershipRevenue: {
            $sum: {
              $cond: [
                { $regexMatch: { input: "$payments.type", regex: /plan/i } },
                "$payments.amount",
                0,
              ],
            },
          },
          sessionsRevenue: {
            $sum: {
              $cond: [
                { $regexMatch: { input: "$payments.type", regex: /session/i } },
                "$payments.amount",
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0, // Remove _id from the output
          totalRevenue: 1,
          cashRevenue: 1,
          cardUpiRevenue: 1,
          membershipRevenue: 1,
          sessionsRevenue: 1,
        },
      },
    ]);

    res.status(200).json(revenue[0]);

  } catch (error) {
    console.error("Error calculating revenue:", error);
    throw error;
  }
};

exports.exportMonthlyRevenue = async (req, res) => {
  try {
    const { year, month } = req.query;
    const startDate = new Date(year, month - 1, 1); // Start of the given month
    const endDate = new Date(year, month, 0, 23, 59, 59, 999); // End of the given month

    const revenueData = await Customer.aggregate([
      {
        $unwind: "$payments", // Unwind the payments array to process each payment separately
      },
      {
        $match: {
          "payments.date": {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $project: {
          _id: 0,
          fullname: 1,
          amountPaid: "$payments.amount",
          paymentDate: "$payments.date",
          paymentType: "$payments.type",
          paymentMode: "$payments.mode",
          paymentNotes: "$payments.notes",
        },
      },
    ]);

    if (revenueData.length === 0) {
      return res.status(404).json({ message: "No revenue data found for the given month" });
    }

    // Convert to worksheet
    const worksheet = XLSX.utils.json_to_sheet(revenueData);

    // Set column widths
    const columnWidths = [
      { wch: 25 }, // Fullname
      { wch: 15 }, // Amount Paid
      { wch: 15 }, // Payment Date
      { wch: 15 }, // Payment Type
      { wch: 20 }, // Payment Mode
      { wch: 25 }, // Payment Notes
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Monthly Revenue");

    // Save the workbook to a file
    const filePath = path.join(__dirname, `monthly_revenue_${month}_${year}.xlsx`);
    XLSX.writeFile(workbook, filePath);

    // Send the file
    res.download(filePath, (err) => {
      if (err) {
        console.log(err);
        res.status(500).send("Could not download the file.");
      }
      // Delete the file after sending
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error("Error calculating revenue:", error);
    throw error;
  }
};