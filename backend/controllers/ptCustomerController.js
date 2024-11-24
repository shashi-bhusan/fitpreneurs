const Customer = require("../models/customer");

// Get all customers who have taken sessions with optional filters
exports.getAllSessionCustomers = async (req, res) => {
  try {
    const { search, filter, page = 1, limit = 8, all } = req.query;
    const query = {
      sessionType: { $ne: "0 Sessions" }, // Only include customers with a session type
    };

    // Search by fullname, emailId, mobileNumber, or address
    if (search) {
      query.$or = [
        { fullname: { $regex: search, $options: "i" } },
        { emailId: { $regex: search, $options: "i" } },
        { mobileNumber: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by date
    if (filter === "last7Days") {
      query.createdAt = {
        $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
      };
    } else if (filter === "last30Days") {
      query.createdAt = {
        $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
      };
    }

    // If the "all" flag is true, return all customers without pagination
    if (all === "true") {
      const customers = await Customer.find(query)
        .populate({
          path: "assignedEmployees",
          select: "fullname emailId",
        })
        .sort({ createdAt: -1 }); // Sort by newest first
      return res.status(200).json({
        customers,
        total: customers.length,
        page: 1,
        pages: 1,
      });
    }

    // Otherwise, paginate the results
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [customers, totalCustomers] = await Promise.all([
      Customer.find(query)
        .populate({
          path: "assignedEmployees",
          select: "fullname",
        })
        .sort({ createdAt: -1 }) // Sort by newest first
        .skip(skip)
        .limit(limitNum),
      Customer.countDocuments(query),
    ]);

    res.status(200).json({
      customers,
      total: totalCustomers,
      page: pageNum,
      pages: Math.ceil(totalCustomers / limitNum),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
