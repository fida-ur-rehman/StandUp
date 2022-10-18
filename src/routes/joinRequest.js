const express = require("express");
const router = express.Router();
const joinRequestController = require("../controllers/joinRequest");
const { isAuthorized } = require("../middleware/auth");

router.get("/all",  joinRequestController.allJoinRequest);
router.post("/single",  joinRequestController.getJoinRequest);
router.post("/org",  joinRequestController.organisationsJoinRequest);
router.get("/user",  joinRequestController.usersJoinRequest);
router.post("/create",  joinRequestController.createJoinRequest);
router.post("/changeStatus",  joinRequestController.changeStatus);
router.post("/delete",  joinRequestController.deletedJoinRequest);


module.exports = router;
