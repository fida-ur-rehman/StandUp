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

  async createUser(req, res) {
    try {
      let { name, email, organisation, designation} = req.body
      if(!name || !email || !organisation || !designation) {
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
            organisation,
            designation
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

  async EditUser(req, res) {
    try {
      const updateOps = {};
      for(const ops of req.body){
          updateOps[ops.propName] = ops.value;
      }
      let currentUser = await userModel.updateOne({_id: req.user._id}, {
        $set: updateOps
      });
      console.log(updateOps)
        if(currentUser) {
          return res.status(200).json({ result: currentUser, msg: "Success" });
        }
    } catch (err) {
      console.log(err)
      return res.status(500).json({ result: err, msg: "Error"});
    }
  }

//   async getDeleteUser(req, res) {
//     let { oId, status } = req.body;
//     if (!oId || !status) {
//       return res.json({ message: "All filled must be required" });
//     } else {
//       let currentUser = userModel.findByIdAndUpdate(oId, {
//         status: status,
//         updatedAt: Date.now(),
//       });
//       currentUser.exec((err, result) => {
//         if (err) console.log(err);
//         return res.json({ success: "User updated successfully" });
//       });
//     }
//   }

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
}

const userController = new User();
module.exports = userController;
