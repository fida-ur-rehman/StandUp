const express = require("express");
const router = express.Router();
const taskController = require("../controllers/task");
const { isAuthorized } = require("../middleware/auth");

router.get("/all", isAuthorized, taskController.allTask);
router.post("/single", isAuthorized, taskController.getTask);
router.post("/userTask", isAuthorized, taskController.userTask);
router.post("/create", isAuthorized, taskController.createTask);
router.post("/edit", isAuthorized, taskController.editTask);
router.post("/delete", isAuthorized, taskController.deleteTask);


module.exports = router;
