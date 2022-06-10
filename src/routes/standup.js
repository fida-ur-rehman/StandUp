const express = require("express");
const router = express.Router();
const standupController = require("../controllers/standup");
const { isAuthorized } = require("../middleware/auth");

router.get("/all", standupController.allStandup);
router.post("/single", isAuthorized, standupController.getStandup);
router.get("/userStandup", isAuthorized, standupController.userStandup);
router.post("/create", isAuthorized, standupController.createStandup);
router.post("/edit", isAuthorized, standupController.editStandup); 
router.post("/fullEdit", isAuthorized, standupController.editWholeStandup);
router.post("/removeMember", isAuthorized, standupController.removeMember);
router.post("/addMembers", isAuthorized, standupController.addMembers);
router.post("/remind", isAuthorized, standupController.remindPending);
router.post("/delete", isAuthorized, standupController.delete);
router.post("/statusPerOccurrence", isAuthorized, standupController.statusPerOccurence);
router.get("/effTable", isAuthorized, standupController.efficiencyNSubmission);


module.exports = router;
