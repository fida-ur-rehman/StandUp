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
const {checkUserStatusAllStandups} = require("../middleware/checkUserStatusAllStandups");


let cron = require('node-cron');
const { statusSchema, statusModel } = require("../models/status");

const moment = require('moment');

const { RRule, RRuleSet, rrulestr } = require('rrule');
const { taskModel } = require("../models/task");
const { organisationModel } = require("../models/organisation");
const { addedToStandup } = require("../middleware/emailService");

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
  //cc added //cc
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
//             let _standup =  await standupModel.updateOne({_id: standup._id}, {$inc: {"occured": 1}})
//             if(_standup.nModified === 1) {
//               activity(standup._id, "Reminder For status", "Standup", [], standup._id, null, null, null)
//             }
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

  async getOrgStandup(req, res) {
    try {
        let {organisationId} = req.body;
        if(!organisationId) {
          return res.status(201).json({ result: "Data Missing", msg: "Error"});
        } else {
          let _standup = await standupModel.findOne({organisationId: mongoose.Types.ObjectId(organisationId)})
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
          let _standupCheck = checkUserStatusAllStandups(_standup)
          return res.status(200).json({ result: _standupCheck.standups, msg: "Success"});
          }
    } catch (err) {
          console.log(err)
          res.status(500).json({ result: err, msg: "Error"});
    }
}

async standupUser(req, res) {
  try {
    let {standupId} = req.body
    if(!standupId) {
      return res.status(201).json({ result: "Data Missing", msg: "Error"});

    } else {
      let _standup = await standupModel.find({_id: mongoose.Types.ObjectId(standupId)})
      .populate({"path": "members.user.details", "select": "_id name email company title img"})
      .select("members.user")

return res.status(200).json({ result: _standup, msg: "Success"});
    }

        
  } catch (err) {
        console.log(err)
        res.status(500).json({ result: err, msg: "Error"});
  }
}

  async createStandup(req, res) {
    try {
      let { name, organisationId, teamName, members, includeMe, statusTypes, start, end, occurrence, key, description} = req.body
      console.log( name, organisationId, teamName, members, includeMe, statusTypes, start, end, occurrence, key, description)
      if(!name || !organisationId || !teamName || !members || !start || !end || !occurrence || !key || !description) {
        return res.status(201).json({ result: "Data Missing", msg: "Error"});
      } else {
        let userOrg = req.user.organisations.find( org => org['organisationId'] == organisationId)
        console.log(req.user)
        if(!userOrg) {
          return res.status(201).json({ result: "Permission Required", msg: "Error"});
        } else {
          let _org1 = await organisationModel.findOne({_id: mongoose.Types.ObjectId(organisationId)}) 
          if(_org1) {
            if(userOrg.role === "ADMIN" || userOrg.permissions.includes("STANDUP-CREATOR")) { //
              if(_org1.plan.standups <= _org1.plan.CStandups) {
                return res.status(201).json({ result: "Plan Exceeds", msg: "Error"});
              } else {
                let _members = [] //INVITE
                let _notMember = []
                let _users = []
                let _lastSubmittedBy = []
      
                key = key.toUpperCase()
      
                let newStartDate = new Date(occurrence.dtstart)
                let newStartDate1 = new Date(Date.UTC(newStartDate.getUTCFullYear(), newStartDate.getUTCMonth(), newStartDate.getUTCDate()))
                let newEndDate = new Date(end)
                let newEndDate1 = new Date(Date.UTC(newEndDate.getUTCFullYear(), newEndDate.getUTCMonth(), newEndDate.getUTCDate()))
      
                occurrence.dtstart = newStartDate1
               
      
                const newRule = new RRule(occurrence)
                let inWord = newRule.toText()
      
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
                      let submitter = {
                        userId: req.user._id
                      }
                      _lastSubmittedBy.push(submitter)
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
                            let submitter = {
                              userId: user._id
                            }
                            _lastSubmittedBy.push(submitter)
                            _members.push(userDoc)
                            _users.push(user._id)
                        }
                        if (index === members.length -1) resolve();
                  })
                })
      console.log(_members)
                memberSetup.then(() => {
                  let _standup = new standupModel({
                      name,
                      organisationId,
                      teamName,
                      members: _members,
                      statusTypes,
                      occurrence,
                      inWord,
                      key: nanoid() + '.' + key.toUpperCase(),
                      start: newStartDate1,
                      end: newEndDate1
                    });
                    _standup
                      .save()
                      .then( async (created) => {
                        // console.log(_users)
                        if(created) {
                          let _org = await organisationModel.updateOne({_id: organisationId}, {$inc: {"plan.Cstandups": 1}})
                          activity(created._id, "New StandUp", "Standup", _users, null, null, null, req.user.name)
                          members.forEach(user => {
                            addedToStandup(user, "fida@synxup.awsapps.com", name, req.user.name)
                            .then((send) => {
                              console.log("Added :", send)
                            })
                            .catch((err) => {
                              console.log("Error in Adding", err);
                              });
                          });
                          return res.status(200).json({ result: created, msg: "Success"});
                        }

                          //Activity
                      })
                }) 
              }
            } else {
              return res.status(201).json({ result: "Permission Required", msg: "Error"});
            }
          } else {
            return res.status(201).json({ result: "Invalid Organisation", msg: "Error"});
          }
        }
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
              if(_standup.nModified === 1) {
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
            let _standup1 = await standupModel.findOne({_id: mongoose.Types.ObjectId(standupId)})
            let _org1 = await organisationModel.findOne({_id: _standup1.organisationId})
            if(_org1.plan.usersPerStandup <= _standup1.members.length){
              return res.status(201).json({ result: "Plan Exceeds", msg: "Error"});
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
                  if(_standup.nModified === 1) {
                      return res.status(200).json({ result: "Updated", msg: "Success" });
                  } else {
                    return res.status(200).json({ result: "Not Updated", msg: "Error" });
                  }
                })
            }
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

  async setAccess(req, res) {
    try {
      let {standupId, state, accessName,} = req.body;
      if(!standupId || !state || ! accessName) {
          return res.status(201).json({ result: "Data Missing", msg: "Error"});
      } else {
        if(accessName === "jira") {
          let _standup = await standupModel.updateOne({_id: standupId}, {$set: {jira: state}})
          if(_standup.nModified === 1) {
              return res.status(200).json({ result: "Updated", msg: "Success" });
          } else {
              return res.status(201).json({ result: "Not Found", msg: "Error"});
          }
        } else if(accessName === "export") {
          let _standup = await standupModel.updateOne({_id: standupId}, {$set: {export: state}})
          if(_standup.nModified === 1) {
              return res.status(200).json({ result: "Updated", msg: "Success" });
          } else {
              return res.status(201).json({ result: "Not Found", msg: "Error"});
          }
        }
      }
  } catch (err) {
  console.log(err)
  return res.status(500).json({ result: err, msg: "Error"});
  }
}

    async statusPerOccurence(req, res) {
      try {
        let {standupId} = req.body;
        if(!standupId) {
            return res.status(201).json({ result: "Data Missing", msg: "Error"});
        } else {
          let _standup = await standupModel.findOne({_id: new mongoose.Types.ObjectId(standupId)})
          
          if(_standup) {
            
            let types = ["Yearly", "Monthly", "Weekly", "Daily"]
            let names = []
            let currentDate1 = new Date()
            let currentDate = new Date(Date.UTC(currentDate1.getUTCFullYear(), currentDate1.getUTCMonth(), currentDate1.getUTCDate(), 0))
            // console.log(_standup.occurrence)
            let rule = new RRule(_standup.occurrence);
            // console.log(rule.all())
            let a = rule.before(currentDate)
            // console.log("aaaa")
            let _output = {
              type: types[_standup.occurrence.freq],
              Recur: rule.toText(),
              data: []
            }

            let privOccurrence = []
            for (let i = 10; i > 0; i--) {

              if(a) {
                privOccurrence.push(a) 
                a = rule.before(a)

              } else {
                break;
              }
            }
            console.log(privOccurrence.length)
            for(let j = privOccurrence.length ; j >= 0 ; j--){
              console.log("abcd")
              if(privOccurrence.length === 1) {
                let _statusCount = await statusModel.find({standupId, "createdAt": {$gte: privOccurrence[j]}}).count()
                _output.data.push({count: _statusCount, occurrence: privOccurrence[j]})
              } else {
                let _statusCount = await statusModel.find({standupId, "createdAt": {$gte: privOccurrence[j+1], $lte: privOccurrence[j]}}).count()
                _output.data.push({count: _statusCount, occurrence: privOccurrence[j]})
              }
     
              // console.log(_statusCount, privOccurrence[j+1])
              // console.log(j)
              // if(j=0){
            
                
              // }
            }

            return res.status(200).json({ result: _output, msg: "Success" });
          } else {
            return res.status(201).json({ result: "Not Found", msg: "Error"});
          }
          
        }
    } catch (err) {
    console.log(err)
    return res.status(500).json({ result: err, msg: "Error"});
    }
  }

  async efficiencyNSubmission(req, res) {
    try {
      let {standupId} = req.body;
      if(!standupId) {
          return res.status(201).json({ result: "Data Missing", msg: "Error"});
      } else {
        let _output = []
        let _standup = await standupModel.findOne({_id: standupId})
        if(_standup) {
          _standup.members.forEach( async(member) => {
            console.log(member)
            let _task = await taskModel.aggregate([
              {$match: {standupId: new mongoose.Types.ObjectId(standupId)}},
              {$group: {
                "_id": "$assignee.details", 
                "count": {"$sum": 1}
              }}

            ])
              _output.push({user: member.user.details, tasks: _task})
              console.log(_task)
          })
        }
        console.log(_output)
          if(_standup) {
            // console.log(_standup[0])
              return res.status(200).json({ result: "Deleted", msg: "Success" });
          } else {
              return res.status(201).json({ result: "Not Found", msg: "Error"});
          }


          // let _task = await taskModel.aggregate([
          //   {$facet: 
          //     {"totalDone": [            
          //       {$match: {standupId: new mongoose.Types.ObjectId(standupId), status: "Done"}},  //, doneBy: "Admin"
          //       {$group: {
          //         "_id": "$assignee", 
          //         "count": {"$sum": 1}
          //       }}
          //     ],
          //     "totalInProgress": [            
          //       {$match: {standupId: new mongoose.Types.ObjectId(standupId), status: "In Progress"}},
          //       {$group: {
          //         "_id": "$assignee", 
          //         "count": {"$sum": 1}
          //       }}
          //     ],
          //   }
          //   }
          // ])

          // console.log(_task[0])
      }
  } catch (err) {
  console.log(err)
  return res.status(500).json({ result: err, msg: "Error"});
  }
}
}

const standupController = new Standup();
module.exports = standupController;
