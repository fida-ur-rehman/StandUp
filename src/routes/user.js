const express = require("express");
const router = express.Router();
const usersController = require("../controllers/user");
const { isAuthorized } = require("../middleware/auth");

router.get("/allUser", usersController.getAllUser);
// router.get("/_user", usersController.getSingleUser);
router.post("/createUser", usersController.createUser);
// router.delete("/user", usersController.getDeleteUser);
router.post("/pinSetup", usersController.pinSetup);

module.exports = router;
