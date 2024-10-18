const express = require("express");
const router= express.Router();
const {handleCustomerExport, handleEmployeeExport}= require("../controllers/exportController");
const {handleCustomerWithSessionExport ,handleCashPaymentCustomerExport, handleOnlinePaymentCustomerExport} = require("../controllers/exportController")

router.get("/exportcustomers", handleCustomerExport);
router.get("/exportemployees", handleEmployeeExport);
router.get("/exportcustomerwithpt", handleCustomerWithSessionExport);
router.get("/customerpaidcash", handleCashPaymentCustomerExport);
router.get("/customerpaidonline", handleOnlinePaymentCustomerExport);

module.exports = router;