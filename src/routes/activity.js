const express = require("express");
const router = express.Router();
const activityController= require("../controllers/activity");
const { isAuthorized } = require("../middleware/auth");

router.get("/all", isAuthorized, activityController.allActivities);
router.get("/user", isAuthorized, activityController.userActivities);
router.post("/delete", isAuthorized, activityController.deleteActivity);

module.exports = router;