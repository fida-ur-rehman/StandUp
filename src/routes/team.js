const express = require("express");
const router = express.Router();
const teamController = require("../controllers/team");
const { isAuthorized } = require("../middleware/auth");

router.get("/all", teamController.allTeam);
router.post("/single", teamController.getTeam);
router.post("/org", teamController.orgTeams);
router.post("/create", teamController.createTeam);
router.post("/editName", teamController.editName);
router.post("/remMember", teamController.removeMembers);
router.post("/addMember", teamController.addMembers);
router.post("/delete", teamController.deleteTeam);


module.exports = router;
