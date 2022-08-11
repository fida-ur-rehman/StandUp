const express = require("express");
const router = express.Router();
const teamController = require("../controllers/team");
const { isAuthorized } = require("../middleware/auth");

router.get("/all", isAuthorized, teamController.allTeam);
router.post("/single", isAuthorized, teamController.getTeam);
router.post("/create", isAuthorized, teamController.createTeam);
router.post("/edit", isAuthorized, teamController.editTeam);
router.post("/delete", isAuthorized, teamController.deleteTeam);


module.exports = router;
