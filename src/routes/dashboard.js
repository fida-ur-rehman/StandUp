const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard");
const { isAuthorized } = require("../middleware/isAdmin");

router.get("/data", isAuthorized, dashboardController.dashboardData);

module.exports = router;