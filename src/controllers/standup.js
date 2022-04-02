const {standupModel} = require("../models/standup");
const {userModel} = require("../models/user")
const shortid = require("shortid")
const authController = require("../controllers/auth");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose");
const { promise } = require("bcrypt/promises");
const {activity} = require("../middleware/activity")

class Standup {
  async allStandup(req, res) {
    try {
      let _standups = await standupModel
        .find({})
        .populate("members.user.details")
        .sort({ _id: -1 })
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
            .populate("members.user.details")
            if (_standup) {
            return res.status(200).json({ result: _standup, msg: "Success"});
            }
          }
      } catch (err) {
            console.log(err)
            res.status(500).json({ result: err, msg: "Error"});
      }
  }

  async userStandup(req, res) {
    try {
          let _standup = await standupModel.aggregate([
            { $match: 
              {
                members: {$elemMatch: {"user.details": req.user._id}}
              }
            }
          ])
          if (_standup) {
          return res.status(200).json({ result: _standup, msg: "Success"});
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
          let _users = []

          let memberSetup = new Promise((resolve, reject) => {

            if(!statusTypes || statusTypes === null) {
                statusTypes = ['Worked On', 'Working On', 'Blocker'];
            }

            if(includeMe === true) {
                let userDoc = {
                    user: {
                      details: req.user._id,
                      role: "Admin"
                    },
                }
                _members.push(userDoc)
            }

            members.forEach(async (member, index) => {
                let user = await userModel.findOne({email: member})
                  if(!user || user === null){
                      _notMember.push(member)
                  } else {
                      let userDoc = {
                          user: {details: user._id}
                      }
                      _members.push(userDoc)
                      _users.push(user._id)
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
                  activity(created._id, "New StandUp", "Standup", _users, null, null, null)
                    return res.status(200).json({ result: created, msg: "Success"});
                    //Activity
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
            let _user = await userModel.findOne({email})
            if(_user) {
              let _standup = await standupModel.updateOne({_id: standupId}, {$pull: {members: {"user.details": _user._id}}})
              if(_standup.modifiedCount === 1) {
                  return res.status(200).json({ result: "Updated", msg: "Success" });
              } else {
                return res.status(201).json({ result: "Not Updated", msg: "Error"});
              }
            } else {
              return res.status(201).json({ result: "Not Found", msg: "Error"});
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
                            user: {details: user._id}
                        }
                        _members.push(userDoc)
                    }
                    if (index === members.length -1) resolve();
                })
            })

            memberSetup.then( async() => {
                let _standup = await standupModel.updateOne({_id: standupId}, {$addToSet: {members: _members}}) //BUG
                if(_standup.modifiedCount === 1) {
                    return res.status(200).json({ result: "Updated", msg: "Success" });
                } else {
                  return res.status(200).json({ result: "Not Updated", msg: "Error" });
                }
              })
          }
    } catch (err) {
      console.log(err)
      return res.status(500).json({ result: err, msg: "Error"});
    }
  }

  async delete(req, res) {
      try {
        let {standupId} = req.body;
        if(!standupId) {
            return res.status(201).json({ result: "Data Missing", msg: "Error"});
        } else {
            let _standup = await standupModel.remove({_id: standupId})
            if(_standup.deletedCount === 1) {
                return res.status(200).json({ result: "Deleted", msg: "Success" });
            } else {
                return res.status(201).json({ result: "Not Found", msg: "Error"});
            }
        }
    } catch (err) {
    console.log(err)
    return res.status(500).json({ result: err, msg: "Error"});
    }
  }
}

const standupController = new Standup();
module.exports = standupController;
