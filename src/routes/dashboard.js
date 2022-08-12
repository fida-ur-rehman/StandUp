const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard");
const { isAdmin } = require("../middleware/isAdmin");

router.get("/data", isAdmin, dashboardController.dashboardData);

module.exports = router;