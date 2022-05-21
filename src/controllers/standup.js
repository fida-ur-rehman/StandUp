const {standupModel} = require("../models/standup");
const {userModel} = require("../models/user")
const shortid = require("shortid")
const authController = require("../controllers/auth");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose");
const { promise } = require("bcrypt/promises");
const {activity} = require("../middleware/activity")

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



// // Create a rule: DAY
// const dayRule = new RRule({
//   "interval": 2,
//   "freq": 3,
//   "dtstart": new Date('2022-05-21'),
//   "count": 3
//   // until: new Date(Date.UTC(2012, 12, 31))
// })


// // console.log(dayRule.all())
// // console.log(RRule.fromString("RRULE:FREQ=YEARLY;COUNT=5;INTERVAL=2;WKST=MO;BYMONTHDAY=21"))
// // console.log(checkIfToday(dayRule))



// // Create a rule: WEEK
// const weekRule = new RRule({
//   interval: 2,
//   freq: 2,
//   byweekday: [0, 1], //, RRule.WE, RRule.TH, RRule.FR, RRule.SA, RRule.SU
//   dtstart: new Date(Date.UTC(2022, 04, 21)),
//   count: 3,
//   // until: new Date(Date.UTC(2022, 05, 21)),
// })

// // console.log(weekRule.all())

// // Create a rule: absolute Monthly
// const absoluteMonthRule = new RRule({
//   interval: 2,
//   freq: 1,
//   bymonthday: [23],
//   dtstart: new Date(Date.UTC(2022, 04, 21)),
//   count: 3,
//   // until: new Date(Date.UTC(2022, 05, 21)),
// })

// // console.log(absoluteMonthRule.all())

// // Create a rule: Relative Monthy
// const relativeMonthlyRule = new RRule({
//   interval: 2,
//   freq: 1,
//   byweekday: [{"weekday": 0, "n": 3}, {"weekday": 1, "n": 2}],
//   dtstart: new Date(Date.UTC(2022, 04, 21)),
//   count: 3,
//   // until: new Date(Date.UTC(2022, 05, 21)),
// })

// // console.log(relativeMonthlyRule.all())

// // Create a rule: Absolute Yearly
// const absoluteYearlyRule = new RRule({
//   interval: 2,
//   freq: 0,
//   bymonth: [2],
//   bymonthday: [23],
//   dtstart: new Date(Date.UTC(2022, 04, 21)),
//   count: 3
//   // until: new Date(Date.UTC(2022, 05, 21)),
// })

// // console.log(absoluteYearlyRule.all())

// // Create a rule: relative Yearly
// const relativeYearlyRule = new RRule({
//   "interval": 2,
//   "freq": 0,
//   "bymonth": [2],
//   "byweekday": [{"weekday": 0, "n": 1}],
//   "dtstart": new Date(Date.UTC(2022, 04, 21)),
//   "count": 3
//   // until: new Date(Date.UTC(2022, 05, 21)),
// })

// console.log(relativeYearlyRule.all())



// Active and Inactive Job
cron.schedule('* * * * *', () => {

let currentDate1 = new Date()
let UTCtime = new Date(Date.UTC(currentDate1.getUTCFullYear(), currentDate1.getUTCMonth(), currentDate1.getUTCDate(), 00))

  standupModel.find()
    .then((_standups) => {
      console.log("!")
      _standups.forEach(async standup => {
        // console.log(currentDate, standup.start)
        if(standup.status === "Not Started" && UTCtime >= standup.start){
          // set Active
          let a = await standupModel.updateOne({_id: standup._id}, {$set: {status: "Active"}})
          console.log("Active")
        } else if(standup.end && standup.status === "Active" && UTCtime >= standup.end){
          let b = await standupModel.updateOne({_id: standup._id}, {$set: {status: "InActive"}})
          console.log("InActive")
        } 
      });
    })
  });

  // Check Occurrrence Send Notification
cron.schedule('* * * * *', () => {
      standupModel.find()
      .then((_standups) => {
        console.log("@")
        _standups.forEach(async standup => {
          let occurrence = checkIfToday(standup.occurrence)
          
          if(standup.status === "Active" && occurrence === true) {
            // send Notification
            activity(standup._id, "Reminder For status", "Standup", null, standup._id, null, null, null)
          }
        });
      })
    });

 
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
      let _standup = await standupModel.find({"members.user.details": req.user._id})
                                        .populate("members.user.details")
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
      let { name, teamName, members, includeMe, statusTypes, start, end, occurrence} = req.body
      if(!name || !teamName || !members || !includeMe || !start || !end || !occurrence) {
        return res.status(201).json({ result: "Data Missing", msg: "Error"});
      } else {
          let _members = [] //INVITE
          let _notMember = []
          let _users = []

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
                start: newStartDate1,
                end: newEndDate1
              });
              _standup
                .save()
                .then((created) => {
                  // console.log(_users)
                  activity(created._id, "New StandUp", "Standup", _users, null, null, null, null)
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
