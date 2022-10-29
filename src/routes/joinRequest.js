const express = require("express");
const router = express.Router();
const joinRequestController = require("../controllers/joinRequest");
const { isAuthorized } = require("../middleware/auth");

router.get("/all", isAuthorized, joinRequestController.allJoinRequest);
router.post("/single", isAuthorized, joinRequestController.getJoinRequest);
router.post("/org", isAuthorized, joinRequestController.organisationsJoinRequest);
router.get("/user", isAuthorized, joinRequestController.usersJoinRequest);
router.post("/create", isAuthorized, joinRequestController.createJoinRequest);
router.post("/changeStatus", isAuthorized, joinRequestController.changeStatus);
router.post("/delete", isAuthorized, joinRequestController.deletedJoinRequest);


module.exports = router;
