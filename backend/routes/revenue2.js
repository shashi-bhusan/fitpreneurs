const express = require("express");
const { getMonthlyRevenueByPaymentMode, getMonthlyRevenue } = require("../controllers/revenue2");

const router = express.Router();

router.get("/monthly-revenue", getMonthlyRevenueByPaymentMode);
router.get("/new-revenue", getMonthlyRevenue);

module.exports = router;
