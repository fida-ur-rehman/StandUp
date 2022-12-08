const express = require("express");
const router = express.Router();
const organisationController = require("../controllers/organisation");
const { isAuthorized } = require("../middleware/auth");

router.get("/all", organisationController.allOrganisation);
router.post("/single", isAuthorized, organisationController.getOrganisation);
router.post("/create", isAuthorized, organisationController.createOrganisation);
router.post("/edit", isAuthorized, organisationController.editOrganisation);
router.post("/setActivity", isAuthorized, organisationController.setActive);
router.post("/plan", isAuthorized, organisationController.orgPlan);
router.post("/verify", isAuthorized, organisationController.verify);
router.post("/allMembers", isAuthorized, organisationController.getAllMembers);
router.post("/changeRole", isAuthorized, organisationController.changeRole);
router.post("/removeMember", isAuthorized, organisationController.removeMember);
router.post("/addMembers", isAuthorized, organisationController.addMembers);
router.post("/addPermission", isAuthorized, organisationController.addPermission);
router.post("/removePermission", isAuthorized, organisationController.removePermission);



module.exports = router;