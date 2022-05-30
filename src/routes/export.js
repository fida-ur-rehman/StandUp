const express = require("express");
const router = express.Router();
const exportController = require("../controllers/export");
const { isAuthorized } = require("../middleware/auth");

router.post("/signIn", isAuthorized, exportController.signIn);
// router.post("/searchIssue", isAuthorized, exportController.searchIssue);
// router.get("/importIssue", isAuthorized, exportController.importIssue);

module.exports = router;
