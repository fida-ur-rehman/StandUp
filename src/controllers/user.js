const {userModel} = require("../models/user");
const authController = require("../controllers/auth");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose");

let JWT_AUTH_TOKEN = process.env.JWT_AUTH_TOKEN;
let JWT_REFRESH_TOKEN = process.env.JWT_REFRESH_TOKEN;

class User {
  async allUser(req, res) {
    try {
      let Users = await userModel
        .find({})
        .sort({ _id: -1 });
      if (Users) {
        return res.status(200).json({ result: Users, msg: "Success"});
      }
    } catch (err) {
        console.log(err)
        return res.status(500).json({ result: err, msg: "Error"});
    }
  }

  async getUser(req, res) {
      try {
        let User = await userModel
        .findOne({_id: req.user._id})
      if (User) {
        return res.status(200).json({ result: User, msg: "Success"});
        }
      } catch (err) {
            console.log(err)
            res.status(500).json({ result: err, msg: "Error"});
      }
  }

  async getAdminUsers(req, res) {
    try {
      let User = await userModel.aggregate([
        {$match: {"role": "Admin"}}
      ])
    if (User) {
      return res.status(200).json({ result: User, msg: "Success"});
      }
    } catch (err) {
          console.log(err)
          res.status(500).json({ result: err, msg: "Error"});
    }
}

  async getUserById(req, res) {
    try {
      let { userId } = req.body;
      if(!userId) {
        return res.status(201).json({ result: "Data Missing", msg: "Error"});
      } else {
        let User = await userModel
        .findOne({_id: userId})
        if (User) {
          return res.status(200).json({ result: User, msg: "Success"});
        }
      }
    } catch (err) {
          console.log(err)
          res.status(500).json({ result: err, msg: "Error"});
    }
}

async getUserByEmail(req, res) {
  try {
    let { email } = req.body;
    if(!email) {
      return res.status(201).json({ result: "Data Missing", msg: "Error"});
    } else {
      let User = await userModel
      .findOne({email})
      if (User) {
        return res.status(200).json({ result: User, msg: "Success"});
      }
    }
  } catch (err) {
        console.log(err)
        res.status(500).json({ result: err, msg: "Error"});
  }
}

async getOrganisationUser(req, res) {
  try {
    let { orgId } = req.body;
    if(!orgId) {
      return res.status(201).json({ result: "Data Missing", msg: "Error"});
    } else {
      let User = await userModel.aggregate([
        {$match: {organisations: {$in: [new mongoose.Types.ObjectId(orgId)]}}}
      ])
      if (User) {
        return res.status(200).json({ result: User, msg: "Success"});
      }
    }
  } catch (err) {
        console.log(err)
        res.status(500).json({ result: err, msg: "Error"});
  }
}

  async createUser(req, res) {
    try {
      let { name, email, company, title} = req.body
      if(!name || !email || !company || !title) {
        return res.status(201).json({ result: "Data Missing", msg: "Error"});
      } else {
        let dbUser = await  userModel.findOne({email: email})
        if(dbUser) {
          // console.log(dbUser)
          // if(dbUser.verified === false) {
          //   authController.sendOTP(req, res)
          // } else if (dbUser.pin === null) {
          //   return res.status(200).json({ result: "Setup Pin", msg: "Success"});
          // } else {
            return res.status(201).json({ result: "Already Exist", msg: "Error"});
          // }
        } else {
          let newUser = new userModel({
            name,
            email,
            company,
            title
          });
          newUser
            .save()
            .then((created) => {
              // console.log(created)
              authController.sendOTP(req, res)
            })
        }
      }
    } catch (err) {
      console.log(err)
      return res.status(500).json({ result: err, msg: "Error"});
    }
  }

  async createAdmin(req, res) {
    try {
      let { name, email, company, title, password, confirmPassword} = req.body
      if(!name || !email || !company || !title || !password || !confirmPassword) {
        return res.status(201).json({ result: "Data Missing", msg: "Error"});
      } else {
        let dbUser = await  userModel.findOne({email: email})
        if(dbUser) {
            return res.status(201).json({ result: "Already Exist", msg: "Error"});
        } else {
          if(req.user.roleType === "NORMAL") {
            return res.status(201).json({ result: "Permission Required", msg: "Error"});
          } else if(req.user.roleType === "SUPER") {
            let newPassword = password.toString();
            let newConfirmPassword = confirmPassword.toString();
            if(newPassword === newConfirmPassword) {
              const _password = await bcrypt.hash(newPassword, 10);
              let newUser = new userModel({
                name,
                email,
                company,
                title,
                password: _password,
                createdBy: req.user._id
              });
            newUser
              .save()
              .then((created) => {
                return res.status(200).json({ result: "Created", msg: "Success" });
              })
          } else {
          return res.status(201).json({ result: "Not Match", msg: "Error"});
        }
          } else {
            return res.status(201).json({ result: "Permission Required", msg: "Error"});
          }
      }
    }
    } catch (err) {
      console.log(err)
      return res.status(500).json({ result: err, msg: "Error"});
    }
  }

  async editAdmin(req, res) {
    try {
      let { name, company, title, adminId} = req.body
      if(!name || !company || !title || !adminId) {
        return res.status(201).json({ result: "Data Missing", msg: "Error"});
      } else {
        if(req.user.roleType === "NORMAL") {
          return res.status(201).json({ result: "Permission Required", msg: "Error"});
        } else if (req.user.roleType === "SUPER") {
            let currentUser = await userModel.updateOne({_id: mongoose.Types.ObjectId(adminId)}, 
                    {$set: {name, company, title}},
                    {runValidators: true}
                );
            if(currentUser.nModified === 1) {
              return res.status(200).json({ result: "Updated", msg: "Success" });
            } else {
              return res.status(201).json({ result: "Not Found", msg: "Error" });
            } 
        } else {
          return res.status(201).json({ result: "Permission Required", msg: "Error"});
        }
      } 
    } catch (err) {
      console.log(err)
      return res.status(500).json({ result: err, msg: "Error"});
    }
  }

  async edit(req, res) {
    try {
      const updateOps = {};
      for(const ops of req.body.data){
          updateOps[ops.propName] = ops.value;
      }
      let currentUser = await userModel.updateOne({_id: req.user._id}, 
        {$set: updateOps},
        {runValidators: true}
        );
        
        if(currentUser.nModified === 1) {
          // console.log(req.user._id)
          return res.status(200).json({ result: "Updated", msg: "Success" });
        }
        
    } catch (err) {
      console.log(err)
      return res.status(500).json({ result: err, msg: "Error"});
    }
  }

  async deletedAdmin(req, res) {
    try {
      let { adminId } = req.body
      if( !adminId) {
        return res.status(201).json({ result: "Data Missing", msg: "Error"});
      } else {
        if(req.user.roleType === "NORMAL") {
          return res.status(201).json({ result: "Permission Required", msg: "Error"});
        } else if (req.user.roleType === "SUPER") {
          let currentUser = await userModel.remove({_id: mongoose.Types.ObjectId(adminId)});          
          if(currentUser.deletedCount === 1) {
            return res.status(200).json({ result: "Deleted", msg: "Success" });
          } else {
            return res.status(201).json({ result: "Not Found", msg: "Error" });
          }
        } else {
          return res.status(201).json({ result: "Permission Required", msg: "Error"});
        }
      } 
    } catch (err) {
      console.log(err)
      return res.status(500).json({ result: err, msg: "Error"});
    }
  }



  async pinSetup(req, res) {
    try {
      let {pin, confirmPin, email} = req.body;
      if( !pin || !confirmPin || !email) {
        return res.status(201).json({ result: "Data Missing", msg: "Error"});
      } else {
        let newPin = pin.toString();
        let newConfirmPin = confirmPin.toString();
        if(newPin === newConfirmPin) {
          const _pin = await bcrypt.hash(newPin, 10);
          userModel.findOneAndUpdate({email}, {$set: {pin: _pin}})
          .then((updated) => {
            // let accessToken = jwt.sign({ data: email }, JWT_AUTH_TOKEN, { expiresIn: '60s' });
            let refreshToken = jwt.sign({ data: email }, JWT_REFRESH_TOKEN, { expiresIn: '1y' });
            return res.status(200).json({ result: refreshToken, msg: "Success"});
          })
        } else {
          return res.status(201).json({ result: "Not Match", msg: "Error"});
        }
      }
    } catch (err) {
      console.log(err)
      return res.status(500).json({ result: err, msg: "Error"});
    }
  }

  async passwordSetup(req, res) {
    try {
      let {password, confirmPassword, email} = req.body;
      if( !password || !confirmPassword || !email) {
        return res.status(201).json({ result: "Data Missing", msg: "Error"});
      } else {
        let newPassword = password.toString();
        let newConfirmPassword = confirmPassword.toString();
        if(newPassword === newConfirmPassword) {
          const _password = await bcrypt.hash(newPassword, 10);
          userModel.findOneAndUpdate({email}, {$set: {password: _password}})
          .then((updated) => {
            // let accessToken = jwt.sign({ data: email }, JWT_AUTH_TOKEN, { expiresIn: '60s' });
            let refreshToken = jwt.sign({ data: email }, JWT_REFRESH_TOKEN, { expiresIn: '1y' });
            return res.status(200).json({ result: refreshToken, msg: "Success"});
          })
        } else {
          return res.status(201).json({ result: "Not Match", msg: "Error"});
        }
      }
    } catch (err) {
      console.log(err)
      return res.status(500).json({ result: err, msg: "Error"});
    }
  }

  async adminResetPassword(req, res) {
    try {
      let {password, confirmPassword, adminId} = req.body;
      if( !password || !confirmPassword || !adminId) {
        return res.status(201).json({ result: "Data Missing", msg: "Error"});
      } else {
        if(req.user.roleType === "NORMAL") {
          return res.status(201).json({ result: "Permission Required", msg: "error"});
        } else if (req.user.roleType === "SUPER") {
          let newpassword = password.toString();
        let newConfirmPassword = confirmPassword.toString();
        if(newpassword === newConfirmPassword) {
          const _password = await bcrypt.hash(newpassword, 10);
          let updatedUser = await userModel.updateOne({_id: adminId}, {$set: {password: _password}})
          if(updatedUser.nModified === 1){
            return res.status(200).json({ result: "Updated", msg: "Success" });
          } else {
            return res.status(201).json({ result: "Not Updated", msg: "Success" });
          }
        } else {
          return res.status(201).json({ result: "Not Match", msg: "Error"});
        }
        } else {
          return res.status(201).json({ result: "Permission Required", msg: "Error"});
        }
      }
    } catch (err) {
      console.log(err)
      return res.status(500).json({ result: err, msg: "Error"});
    }
  }

    async upload(req, res) {
      try {
        await userModel.updateOne({_id: req.user._id}, {$set: {img: req.file.filename}})
        .then(result => {console.log(result)})
        .catch(err => {console.log(err)})
        res.json({file: req.file})
    } catch (err) {
      console.log(err)
      return res.status(500).json({ result: err, msg: "Error"});
    }
    }

    async getAllUploads(req, res) {
      try {
          let gfs = require("../../index")
          gfs.files.find().toArray((err, files) => {
            if(!files || files.length === 0){
              return res.status(404).json({
                err: "no file exist"
              });
            }
            return res.json(files);
          })
      } catch (err) {
        console.log(err)
        return res.status(500).json({ result: err, msg: "Error"});
      }
    }

    async getSingleUpload(req, res) {
      try {
        let gfs = require("../../index")
        gfs.files.findOne({filename: req.params.filename} , (err, files) => {
          if(!files || files.length === 0){
            return res.status(404).json({
              err: "no file exist"
            });
          }
          
          return res.json(files);
        }) 
    } catch (err) {
      console.log(err)
      return res.status(500).json({ result: err, msg: "Error"});
    }
    }

    async getSingleImg(req, res) {
      try {
        let gfs = require("../../index")
        gfs.files.findOne({filename: req.params.filename} , (err, file) => {
          if(!file || file.length === 0){
            return res.status(404).json({
              err: "no file exist"
            });
          }
          if(file.contentType === "image/jpeg" || file.contentType === "image/png" || file.contentType === "image/jpg"){
            const readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res);
          } else {
            res.status(404).json({
              err: "not An Image"
            });
          }
        })
    } catch (err) {
      console.log(err)
      return res.status(500).json({ result: err, msg: "Error"});
    }
    }
}

const userController = new User();
module.exports = userController;
