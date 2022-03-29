const express = require("express");
const router = express.Router();
const standupController = require("../controllers/standup");
const { isAuthorized } = require("../middleware/auth");

router.get("/all", isAuthorized, standupController.allStandup);
router.post("/single", isAuthorized, standupController.getStandup);
router.post("/create", isAuthorized, standupController.createStandup);
router.post("/edit", isAuthorized, standupController.editStandup);
router.post("/removeMember", isAuthorized, standupController.removeMember);
router.post("/addMembers", isAuthorized, standupController.addMembers);
// router.post("/delete", isAuthorized, standupController.editStandup);


module.exports = router;
