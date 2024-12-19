const express = require("express");
const { getMonthlyRevenueByPaymentMode, getMonthlyRevenue, exportMonthlyRevenue } = require("../controllers/revenue2");

const router = express.Router();

router.get("/monthly-revenue", getMonthlyRevenueByPaymentMode);
router.get("/new-revenue", getMonthlyRevenue);
router.get("/revenue-export", exportMonthlyRevenue);


module.exports = router;
