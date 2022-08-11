const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
// const { loginCheck, isAuth, isAdmin } = require("../middleware/auth");

router.post("/otp", authController.sendOTP);
router.post("/verifyOtp", authController.verifyOTP);
router.post("/verifyPin", authController.verifyPin);
router.post("/verifyPassword", authController.verifyPassword);


module.exports = router;