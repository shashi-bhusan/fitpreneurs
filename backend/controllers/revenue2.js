const Customer = require("../models/customer");
const moment = require("moment");

// Get total amount collected by payment mode for the current month
exports.getMonthlyRevenueByPaymentMode = async (req, res) => {
  try {
    const startOfMonth = moment().startOf('month').toDate();
    const endOfMonth = moment().endOf('month').toDate();

    // Aggregate for cash and online payments
    const revenueData = await Customer.aggregate([
      {
        $match: {
          paymentMode: { $in: ["cash", "online"] },
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
    const onlineRevenue = revenueData.find((data) => data._id === "online")?.totalCollected || 0;

    res.status(200).json({
      cashRevenue,
      onlineRevenue,
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
          onlineUpiRevenue: {
            $sum: {
              $cond: [
                { $or: [{ $eq: ["$payments.mode", "online"] }, { $eq: ["$payments.mode", "upi"] }] },
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
          onlineUpiRevenue: 1,
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
