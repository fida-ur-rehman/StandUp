const {standupModel} = require("../models/standup");
const {userModel} = require("../models/user")
// const shortid = require("shortid")
const {nanoid} = require("nanoid")

const authController = require("../controllers/auth");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose");
const { promise } = require("bcrypt/promises");
const {activity} = require("../middleware/activity")

const {checkUserStatus} = require("../middleware/checkUserStatus");


let cron = require('node-cron');
const { statusSchema } = require("../models/status");

const moment = require('moment');

const { RRule, RRuleSet, rrulestr } = require('rrule')

function checkIfToday(rruleStr){
  let rule = new RRule(rruleStr);
  // console.log(rule)
  let currentDate1 = new Date()
  let currentDate = new Date(Date.UTC(currentDate1.getUTCFullYear(), currentDate1.getUTCMonth(), currentDate1.getUTCDate(), 00))
  let nextOccurrence    = rule.after(currentDate, true); // next rule date including today
  let nextOccurutc      = moment(nextOccurrence).utc(); // convert today into utc
  let match             = moment(nextOccurutc).isSame(currentDate, 'day'); // check if 'DAY' is same
  return match;
}

// function chechAlphanumeric(str) {
//   return /^[A-Za-z0-9]*$/.test(str);
// }
///commetn in serverir
// Active and Inactive Job
// cron.schedule('* * * * *', () => {

// let currentDate1 = new Date()
// let UTCtime = new Date(Date.UTC(currentDate1.getUTCFullYear(), currentDate1.getUTCMonth(), currentDate1.getUTCDate(), 00))
// // console.log(UTCtime, "test")
  
//   standupModel.find()
//     .then((_standups) => {
//       console.log("!")
//       _standups.forEach(async standup => {
//         // console.log(standup._id, standup.start, standup.end, UTCtime)
//         if(standup.status === "Not Started" && UTCtime >= standup.start){
//           // set Active
//           let a = await standupModel.updateOne({_id: standup._id}, {$set: {status: "Active"}})
//           console.log(standup._id, standup.start, standup.end, UTCtime, "Active")
//         } else if(standup.end && standup.status === "Active" && UTCtime >= standup.end){
//           let b = await standupModel.updateOne({_id: standup._id}, {$set: {status: "InActive"}})
//           console.log(standup._id, standup.start, standup.end, UTCtime, "InActive")
//         } else if(standup.status === "Active" && standup.start > UTCtime || standup.status === "InActive" && standup.start > UTCtime) {
//           let b = await standupModel.updateOne({_id: standup._id}, {$set: {status: "Not Started"}})
//           console.log(standup._id, standup.start, standup.end, UTCtime, "Not Started")
//         }
//       });
//     })
//   });

//   // Check Occurrrence Send Notification
// cron.schedule('* * * * *', () => {
//       standupModel.find()
//       .then((_standups) => {
//         console.log("@")
//         _standups.forEach(async standup => {
//           let occurrence = checkIfToday(standup.occurrence)
          
//           if(standup.status === "Active" && occurrence === true) {
//             // send Notification
//             activity(standup._id, "Reminder For status", "Standup", [], standup._id, null, null, null)
//           }
//         });
//       })
//     });

 
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
              let _standupCheck = checkUserStatus(_standup)
              
            return res.status(200).json({ result: _standupCheck.standup, msg: "Success"});
            }
          }
      } catch (err) {
            console.log(err)
            res.status(500).json({ result: err, msg: "Error"});
      }
  }

  async userStandup(req, res) {
    try {
      let {option} = req.body
      let sortBy;
      if(option === "AtoB"){
        sortBy = {
          "members.user.details.name": -1
        }
      } 
      let _standup = await standupModel.find({"members.user.details": req.user._id})
                                        .populate({"path": "members.user.details"})
                                        // .getFilter
                                        // .sort({"members.user.details.name": 1})
  //         let _standup = await standupModel.aggregate([
  //           { $match: 
  //             {
  //               members: {$elemMatch: {"user.details": req.user._id}}
  //             }},
  //             {
  //               $unwind: {
  //                 path: '$members'
  //               }
  //             },
  //             {
  //               $lookup: {
  //                   from: 'users',
  //                   localField: 'members.user.details',
  //                   foreignField: '_id',
  //                   as: 'members.user.details'
  //               }
  //           },
  //           {
  //             $unwind: {
  //                 path: '$members.user.details'
  //             }
  //         },
  //         {
  //           $group: {
  //               _id: '$_id',
  //               members: {
  //                 $push: '$members.user'
  //               }
  //           }
  //       },
  //       {
  //         $lookup: {
  //             from: 'standups',
  //             localField: '_id',
  //             foreignField: '_id',
  //             as: 'standupDetails'
  //         }
  //     },
  //     {
  //       $unwind: {
  //         path: '$standupDetails'
  //     }
  //     },
  //     {
  //       $addFields: {
  //           'standupDetails.members': '$members'
  //       }
  //   },
  //   {
  //     $replaceRoot: {
  //         newRoot: '$standupDetails'
  //     }
  // }

  //         ])
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
      let { name, teamName, members, includeMe, statusTypes, start, end, occurrence, key} = req.body
      if(!name || !teamName || !members || !includeMe || !start || !end || !occurrence || !key) {
        return res.status(201).json({ result: "Data Missing", msg: "Error"});
      } else {
          let _members = [] //INVITE
          let _notMember = []
          let _users = []

          key = key.toUpperCase()

          let newStartDate = new Date(occurrence.dtstart)
          let newStartDate1 = new Date(Date.UTC(newStartDate.getUTCFullYear(), newStartDate.getUTCMonth(), newStartDate.getUTCDate()))
          let newEndDate = new Date(end)
          let newEndDate1 = new Date(Date.UTC(newEndDate.getUTCFullYear(), newEndDate.getUTCMonth(), newEndDate.getUTCDate()))

          occurrence.dtstart = newStartDate1

          // const newRule = new RRule(occurrence)
          // console.log(newRule.all())

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
                statusTypes,
                occurrence,
                key: nanoid() + '.' + key.toUpperCase(),
                start: newStartDate1,
                end: newEndDate1
              });
              _standup
                .save()
                .then((created) => {
                  // console.log(_users)
                  activity(created._id, "New StandUp", "Standup", _users, null, null, null, req.user.name)
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

  async editWholeStandup(req, res) {
    try {
      let {standupId, data} = req.body;
        if(!standupId) {
          return res.status(201).json({ result: "Data Missing", msg: "Error"});
        } else {
          let _members = [] //INVITE
          let _notMember = []
          let _users = []


  
            const updateOps = {};
            for(const ops of data){
              if(ops.propName === "occurrence"){
                let newStartDate = new Date(ops.value.dtstart)
                let newStartDate1 = new Date(Date.UTC(newStartDate.getUTCFullYear(), newStartDate.getUTCMonth(), newStartDate.getUTCDate()))
                let newEndDate = new Date(ops.value.until)
                let newEndDate1 = new Date(Date.UTC(newEndDate.getUTCFullYear(), newEndDate.getUTCMonth(), newEndDate.getUTCDate()))

                ops.value.dtstart = newStartDate1;

                updateOps[ops.propName] = ops.value;
              } else if (ops.propName === "start"){
                let newStartDate = new Date(ops.value.start)
                let newStartDate1 = new Date(Date.UTC(newStartDate.getUTCFullYear(), newStartDate.getUTCMonth(), newStartDate.getUTCDate()))
                updateOps[ops.propName] = newStartDate1;
              } else if (ops.propName === "end"){
                let newEndDate = new Date(ops.value.end)
                let newEndDate1 = new Date(Date.UTC(newEndDate.getUTCFullYear(), newEndDate.getUTCMonth(), newEndDate.getUTCDate()))
                updateOps[ops.propName] = newEndDate1;
              } else if (ops.propName === "members"){
                let newEndDate = new Date(ops.value.end)
                let newEndDate1 = new Date(Date.UTC(newEndDate.getUTCFullYear(), newEndDate.getUTCMonth(), newEndDate.getUTCDate()))
                updateOps[ops.propName] = newEndDate1;
              }else {
                updateOps[ops.propName] = ops.value;
              }
              
            }
            let _standup = await standupModel.updateOne({_id: standupId}, {
                $set: updateOps
            });
            // console.log(updateOps)
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

  async remindPending(req, res) {
    try {
        let {standupId} = req.body;
          if(!standupId) {
            return res.status(201).json({ result: "Data Missing", msg: "Error"});
          } else {
            let _standup = await standupModel.findOne({_id: standupId})
            .populate("members.user.details")
            if (_standup) {
              let _toBeRemind = []
              let _standupCheck = checkUserStatus(_standup)

              let memberSetup = new Promise((resolve, reject) => {
                _standupCheck.standup.lastSubmittedBy.forEach( async (user, index) => {
                  if(!user.status){
                    _toBeRemind.push(user.userId)
                  }
                  if (index === _standupCheck.standup.lastSubmittedBy.length -1) resolve();
                });
              })

              memberSetup.then(() => {
                if(_toBeRemind.length === 0) {
                  return res.status(200).json({ result: "No Users To Remind", msg: "Success"});
                } else {
                  activity(standupId, "Reminder For status from Admin", "Standup", _toBeRemind, null, null, null, req.user.name)
                return res.status(200).json({ result: "Reminded", msg: "Success"});
                }
              })
            } else {
              return res.status(201).json({ result: "Not Found", msg: "Error"});
            }
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
