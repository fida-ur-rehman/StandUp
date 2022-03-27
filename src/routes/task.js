const express = require("express");
const router = express.Router();
const taskController = require("../controllers/task");
const { isAuthorized } = require("../middleware/auth");

router.get("/allStandup", taskController.allTask);
router.post("/standup", taskController.getTask);
router.post("/createStandup", taskController.craeteTask);
router.post("/editStandup", taskController.editTask);
router.post("/deleteTask", taskController.deleteTask);


module.exports = router;
