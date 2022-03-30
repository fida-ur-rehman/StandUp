const express = require("express");
const router = express.Router();
const usersController = require("../controllers/user");
const { isAuthorized } = require("../middleware/auth");

router.get("/all", isAuthorized, usersController.allUser);
router.get("/single", isAuthorized, usersController.getUser);
router.post("/singleId", isAuthorized, usersController.getUserById);
router.post("/createUser", usersController.createUser);
// router.delete("/user", usersController.getDeleteUser);
router.post("/pinSetup", usersController.pinSetup);

module.exports = router;
