const express = require("express");
const router = express.Router();
const commentControllert = require("../controllers/comment");
const { isAuthorized } = require("../middleware/auth");

router.get("/all", isAuthorized, commentControllert.allComment);
router.post("/single", isAuthorized, commentControllert.getComment);
router.post("/entity", isAuthorized, commentControllert.entityComments);
router.post("/create", isAuthorized, commentControllert.creatComment);
router.post("/edit", isAuthorized, commentControllert.editComment);
router.post("/delete", isAuthorized, commentControllert.deleteComment);


module.exports = router;
