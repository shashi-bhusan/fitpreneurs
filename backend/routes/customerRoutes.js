const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const auth = require('../middleware/auth');

router.get("/revenue", customerController.getRevenue);
router.get('/expiring', customerController.getExpiringMemberships);
router.get("/expiring-memberships", customerController.getExpiringMemberships);
router.get("/upcoming-birthdays", customerController.getUpcomingBirthdays);

router.post("/", customerController.createCustomer);
router.get("/", customerController.getAllCustomers);
router.get("/:id", customerController.getCustomerById);
router.put("/:id", customerController.updateCustomer);
router.delete("/all", customerController.deleteAllCustomers);
router.delete("/:id", customerController.deleteCustomer);







module.exports = router;
