const express = require("express");
const router = express.Router();
const planController = require("../controllers/plan");
const { isAuthorized } = require("../middleware/isAdmin");

router.get("/all", isAuthorized, planController.allPlan);
router.post("/single", isAuthorized, planController.getPlan);
router.post("/create", isAuthorized, planController.createPlan);
router.post("/edit", isAuthorized, planController.editPlan);
router.post("/delete", isAuthorized, planController.deletePlan);
router.post("/setActive", isAuthorized, planController.setStatus);
router.post("/setVisibility", isAuthorized, planController.setVisibilty);
router.post("/addOrg", isAuthorized, planController.addOrganisation);


module.exports = router;
