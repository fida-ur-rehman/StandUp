const standupModel = require("../models/standup");
const userModel = require("../models/user")
const authController = require("../controllers/auth");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose");
const { promise } = require("bcrypt/promises");


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
      let { name, teamName, members, includeMe, statusTypes} = req.body
      if(!name || !teamName || !members || !includeMe) {
        return res.status(201).json({ result: "Data Missing", msg: "Error"});
      } else {
          let _members = [] //INVITE
          let _notMember = []

          let memberSetup = new Promise((resolve, reject) => {

            if(!statusTypes || statusTypes === null) {
                statusTypes = ['Worked On', 'Working On', 'Blocker'];
            }

            if(includeMe === true) {
                let userDoc = {
                    userId: req.user._id,
                    email: req.user.email
                }
                _members.push(userDoc)
            }

            members.forEach(async (member, index) => {
                let user = await userModel.findOne({email: member})
                  if(!user || user === null){
                      _notMember.push(member)
                  } else {
                      let userDoc = {
                          userId: user._id,
                          email: user.email
                      }
                      _members.push(userDoc)
                  }
                  if (index === members.length -1) resolve();
            })
          })

          memberSetup.then(() => {
            let _standup = new standupModel({
                name,
                teamName,
                members: _members,
                statusTypes
              });
              _standup
                .save()
                .then((created) => {
                    return res.status(200).json({ result: created, msg: "Success"});
                })
          })
      }
    } catch (err) {
      console.log(err)
      return res.status(500).json({ result: err, msg: "Error"});
    }
  }

  async editStandup(req, res) {
    try { //only NAME, TEAMNAME AND STATUSTYPES Will be chnage here
        let {standupId} = req.body;
          if(!standupId) {
            return res.status(201).json({ result: "Data Missing", msg: "Error"});
          } else {
            const updateOps = {};
            for(const ops of req.body.data){
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

  async removeMember(req, res) {
    try {
        let {standupId, email} = req.body;
          if(!standupId || !email) {
            return res.status(201).json({ result: "Data Missing", msg: "Error"});
          } else {

            let _standup = await standupModel.updateOne({_id: standupId}, {$pull: {members: {email: email}}})
            if(_standup.modifiedCount === 1) {
                return res.status(200).json({ result: "Updated", msg: "Success" });
            }
          }
    } catch (err) {
      console.log(err)
      return res.status(500).json({ result: err, msg: "Error"});
    }
  }

  async addMembers(req, res) {
    try {
        let {standupId, members} = req.body;
          if(!standupId || !members) {
            return res.status(201).json({ result: "Data Missing", msg: "Error"});
          } else {
            let _members = [] //INVITE
            let _notMember = []

            let memberSetup = new Promise((resolve, reject) => {

                members.forEach(async (member, index) => {
                    let user = await userModel.findOne({email: member})
                    if(!user || user === null){
                        _notMember.push(member)
                    } else {
                        let userDoc = {
                            userId: user._id,
                            email: user.email
                        }
                        _members.push(userDoc)
                    }
                    if (index === members.length -1) resolve();
                })
            })

            memberSetup.then( async() => {
                let _standup = await standupModel.updateOne({_id: standupId}, {$addToSet: {members: {$each: _members}}})
                if(_standup.modifiedCount === 1) {
                    return res.status(200).json({ result: "Updated", msg: "Success" });
                }
              })
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
