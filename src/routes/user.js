const express = require("express");
const router = express.Router();
const usersController = require("../controllers/user");
const { isAuthorized } = require("../middleware/auth");

const path = require('path')
const multer = require("multer");
const {GridFsStorage} = require("multer-gridfs-storage");
const crypto = require("crypto")

// Storage Engine
const storage = new GridFsStorage({
    url: process.env.DATABASE,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          console.log(filename)
          const fileInfo = {
            filename: filename,
            bucketName: 'uploads'
          };
          resolve(fileInfo);
        });
      });
    }
  });
  const upload = multer({ storage });

router.get("/all", isAuthorized, usersController.allUser);
router.get("/single", isAuthorized, usersController.getUser);
router.post("/singleId", isAuthorized, usersController.getUserById);
router.post("/createUser", usersController.createUser);
// router.delete("/user", usersController.getDeleteUser);
router.post("/pinSetup", usersController.pinSetup);

//uploads
router.post("/upload", isAuthorized, upload.single("image"), usersController.upload)
router.get("/uploads", isAuthorized, usersController.getAllUploads)
router.get("/uploads/:filename", isAuthorized, usersController.getSingleUpload)
router.get("/image/:filename", usersController.getSingleImg)

module.exports = router;
