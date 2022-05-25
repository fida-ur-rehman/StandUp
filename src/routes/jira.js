const express = require("express");
const router = express.Router();
const jiraController = require("../controllers/jira");
const { isAuthorized } = require("../middleware/auth");

router.post("/signIn", isAuthorized, jiraController.signIn);
// router.post("/searchIssue", isAuthorized, jiraController.searchIssue);
router.get("/importIssue", isAuthorized, jiraController.importIssue);

module.exports = router;
