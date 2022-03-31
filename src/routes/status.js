const express = require("express");
const router = express.Router();
const statusController = require("../controllers/status");
const { isAuthorized } = require("../middleware/auth");

router.get("/all", isAuthorized, statusController.allStatus);
router.post("/single", isAuthorized, statusController.getStatus);

router.post("/standupUser", isAuthorized, statusController.standupUserStatus);
router.post("/create", isAuthorized, statusController.craeteStatus);
router.post("/edit", isAuthorized, statusController.editStatus);
router.post("/delete", isAuthorized, statusController.deleteStatus);


module.exports = router;
