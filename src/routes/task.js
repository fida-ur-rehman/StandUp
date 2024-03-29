const express = require("express");
const router = express.Router();
const taskController = require("../controllers/task");
const { isAuthorized } = require("../middleware/auth");

router.get("/all", isAuthorized, taskController.allTask);
router.post("/single", isAuthorized, taskController.getTask);
router.post("/standupTask", isAuthorized, taskController.standupTask);
router.post("/userTask", isAuthorized, taskController.userTask);
router.post("/details", isAuthorized, taskController.taskDetails);
router.post("/create", isAuthorized, taskController.createTask);
router.post("/edit", isAuthorized, taskController.editTask);
router.post("/delete", isAuthorized, taskController.deleteTask);
router.post("/progress", isAuthorized, taskController.changeProgress);

module.exports = router;
