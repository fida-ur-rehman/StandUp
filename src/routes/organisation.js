const express = require("express");
const router = express.Router();
const organisationController = require("../controllers/organisation");
const { isAuthorized } = require("../middleware/auth");

router.get("/all", isAuthorized, organisationController.allOrganisation);
router.post("/single", isAuthorized, organisationController.getOrganisation);
router.post("/create", isAuthorized, organisationController.createOrganisation);
router.post("/edit", isAuthorized, organisationController.editOrganisation);
router.post("/setActivity", isAuthorized, organisationController.setActive);
router.post("/plan", isAuthorized, organisationController.orgPlan);
router.post("/verify", isAuthorized, organisationController.verify);


module.exports = router;