const standupModel = require("../models/standup");
const authController = require("../controllers/auth");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose");


class Standup {
  async allStandup(req, res) {
    try {
      let _standups = await standupModel
        .find({})
        .sort({ _id: -1 });
      if (_standups) {
        return res.status(200).json({ result: _standups, msg: "Success"});
      }
    } catch (err) {
        console.log(err)
        return res.status(500).json({ result: err, msg: "Error"});
    }
  }

  async getStandup(req, res) {
      try {
          let {standupId} = req.body;
          if(!standupId) {
            return res.status(201).json({ result: "Data Missing", msg: "Error"});
          } else {
            let _standup = await standupModel.findOne({_id: standupId})
            if (_standup) {
            return res.status(200).json({ result: _standup, msg: "Success"});
            }
          }
      } catch (err) {
            console.log(err)
            res.status(500).json({ result: err, msg: "Error"});
      }
  }

  async createStandup(req, res) {
    try {
      let { name, teamName, members, includeMe} = req.body
      if(!name || !teamName || !members || !includeMe) {
        return res.status(201).json({ result: "Data Missing", msg: "Error"});
      } else {
          let _standup = new standupModel({
            name,
            teamName,
            members: members,
          });
          _standup
            .save()
            .then((created) => {
                return res.status(200).json({ result: _standup, msg: "Success"});
            })
      }
    } catch (err) {
      console.log(err)
      return res.status(500).json({ result: err, msg: "Error"});
    }
  }

  async editStandup(req, res) {
    try {
        let {standupId} = req.body;
          if(!standupId) {
            return res.status(201).json({ result: "Data Missing", msg: "Error"});
          } else {
            const updateOps = {};
            for(const ops of req.body){
                updateOps[ops.propName] = ops.value;
            }
            let _standup = await standupModel.updateOne({_id: standupId}, {
                $set: updateOps
            });
            console.log(updateOps)
            if(_standup) {
            return res.status(200).json({ result: _standup, msg: "Success" });
            }
          }
    } catch (err) {
      console.log(err)
      return res.status(500).json({ result: err, msg: "Error"});
    }
  }

//   async deleteStandup(req, res) {
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
}

const standupController = new Standup();
module.exports = standupController;
