const express = require("express");
const router = express.Router();
const standupController = require("../controllers/standup");
const { isAuthorized } = require("../middleware/auth");

router.get("/allStandup", standupController.allStandup);
router.post("/standup", standupController.getStandup);
router.post("/createStandup", standupController.createStandup);
router.post("/editStandup", standupController.editStandup);


module.exports = router;
