const express = require("express");
const router = express.Router();
const usersController = require("../controllers/user");
const { isAuthorized } = require("../middleware/auth");
const { isAdmin } = require("../middleware/isAdmin");

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

router.get("/all", usersController.allUser);
router.get("/single", isAuthorized, usersController.getUser);
router.get("/adminUsers", isAdmin, usersController.getAdminUsers);
router.post("/singleByEmail", isAdmin, usersController.getUserByEmail);
router.get("/organisation", isAdmin, usersController.getOrganisationUser);
router.post("/singleId", isAuthorized, usersController.getUserById);
router.post("/createUser", usersController.createUser);
router.post("/edit", isAuthorized, usersController.edit); /////IMPortant Verifuication ADMIN
// router.delete("/user", usersController.getDeleteUser);
router.post("/pinSetup", usersController.pinSetup);
router.post("/passwordSetup", usersController.passwordSetup);

//uploads
router.post("/upload", isAuthorized, upload.single("image"), usersController.upload)
router.get("/uploads", isAuthorized, usersController.getAllUploads)
router.get("/uploads/:filename", isAuthorized, usersController.getSingleUpload)
router.get("/image/:filename", usersController.getSingleImg)

router.post("/createAdmin", isAdmin, usersController.createAdmin);
router.post("/editAdmin", isAdmin, usersController.editAdmin);
router.post("/adminResetPassword", isAdmin, usersController.adminResetPassword);
router.post("/deleteAdmin", isAdmin, usersController.deletedAdmin);

router.get("/organisationDetails", isAuthorized, usersController.getUserOrganisationDetails);





module.exports = router;
