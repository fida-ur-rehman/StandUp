const express = require("express");
const router = express.Router();
const planController = require("../controllers/plan");
const { isAdmin } = require("../middleware/isAdmin");

router.get("/all", isAdmin, planController.allPlan);
router.post("/single", isAdmin, planController.getPlan);
router.post("/create", isAdmin, planController.createPlan);
router.post("/edit", isAdmin, planController.editPlan);
router.post("/delete", isAdmin, planController.deletePlan);
router.post("/setActive", isAdmin, planController.setStatus);
router.post("/setVisibility", isAdmin, planController.setVisibilty);
router.post("/addOrg", isAdmin, planController.addOrganisation);


module.exports = router;
