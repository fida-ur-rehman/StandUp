const express = require("express");
const router = express.Router();
const statusController = require("../controllers/status");
const { isAuthorized } = require("../middleware/auth");

router.get("/all", statusController.allStatus);
router.post("/single", isAuthorized, statusController.getStatus);

router.post("/standupUser", statusController.standupUserStatus);
router.post("/create", isAuthorized, statusController.craeteStatus);
router.post("/edit", isAuthorized, statusController.editStatus);
router.post("/delete", isAuthorized, statusController.deleteStatus);

router.get("/submissionRate", isAuthorized, statusController.statusSubmissionRate);


module.exports = router;
