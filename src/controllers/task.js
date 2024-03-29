const {taskModel} = require("../models/task");
const mongoose = require("mongoose")
const {activity} = require("../middleware/activity")
const shortid = require("shortid");
const {createTaskId} = require("../middleware/createTaskId")
const {convertSeconds} = require("../middleware/convertSeconds")
const {convertDays} = require("../middleware/convertDays")


const {userModel } = require("../models/user");
const { standupModel } = require("../models/standup");
const { commentModel } = require("../models/comment");
const { statusModel } = require("../models/status");
const moment = require("moment");
const { setPerformance } = require("../middleware/setPerformance");
const { organisationModel } = require("../models/organisation");
// function createTaskId(taskSeries, lastTaskId){
//   let _lastTaskId = lastTaskId + 1
//   let mainId = taskSeries + '-' +  _lastTaskId 
//   return mainId;
// }

var startDate = new Date('2022-05-30T04:17:55.769+0530');
var endDate = new Date('2022-06-30T04:20:55.769+0530');



let _seconds = Math.abs((endDate.getTime()-startDate.getTime()) /1000 )
console.log(convertDays(_seconds), (25/100)*100)

// function secondsToDhms(seconds) {
//   seconds = Number(seconds);
//   var d = Math.floor(seconds / (3600*24));
//   var h = Math.floor(seconds % (3600*24) / 3600);
//   var m = Math.floor(seconds % 3600 / 60);
//   var s = Math.floor(seconds % 60);
  
//   var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
//   var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
//   var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
//   var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
//   return dDisplay + hDisplay + mDisplay + sDisplay;
//   }

  // console.log(convertSeconds(startDate, endDate), "abcd")

// console.log(createTaskId("a", 10))
// let taskId = createTaskId(11, "StAn")
// let [ uniqueId, key ] = taskId.split('.');
// console.log(taskId)
// console.log(uniqueId)
// console.log(key)
// let [ key1, lastTaskId2] = key.split('-')
// console.log(key1)
// console.log(lastTaskId2)

class Task {
  async allTask(req, res) {
    try {
      let _task = await taskModel
        .find({})
        .sort({ _id: -1 });
      if (_task) {
        return res.status(200).json({ result: _task, msg: "Success"});
      }
    } catch (err) {
        console.log(err)
        return res.status(500).json({ result: err, msg: "Error"});
    }
  }

  async getTask(req, res) {
      try {
          let {taskId} = req.body;
          if(!taskId) {
            return res.status(201).json({ result: "Data Missing", msg: "Error"});
          } else {
            let _task = await taskModel.findOne({_id: mongoose.Types.ObjectId(taskId)})
            console.log(_task)
            if (_task) {
                console.log(_task)
            return res.status(200).json({ result: _task, msg: "Success"});
            }
          }
      } catch (err) {
            console.log(err)
            res.status(500).json({ result: err, msg: "Error"});
      }
  }

  
  async standupTask(req, res) {
    try {
        let {standupId} = req.body;
        if(!standupId) {
          return res.status(201).json({ result: "Data Missing", msg: "Error"});
        } else {
          let _task = await taskModel.aggregate([
            { $match: 
                {
                  standupId: new mongoose.Types.ObjectId(standupId),
                }
              }
          ])
          if (_task) {
              console.log(_task)
          return res.status(200).json({ result: _task, msg: "Success"});
          }
        }
    } catch (err) {
          console.log(err)
          res.status(500).json({ result: err, msg: "Error"});
    }
}

  async userTask(req, res) {
    try {
      let {option} = req.body
      let sortBy;
      if(option === "AtoB"){
        sortBy = {
          "title": 1
        }
      } else if (option === "Newest"){
        sortBy = {
          "createdAt": -1
        }
      } else if (option === "Oldest"){
        sortBy = {
          "createdAt": 1
        }
      }

      let _userStandup = await standupModel.aggregate( [
        { $match: 
          {
            members: {$elemMatch: {"user.details": req.user._id}}
          }
        },
        {
          $group:{_id:null, array:{$push:"$_id"}}
      },
        {
          $project: {
            array:true,_id:false
          }
        }
      ])

          if (_userStandup) {
            let _userStandup1 = _userStandup[0].array
        
              let _task = await taskModel.find({standupId: _userStandup1}).sort(sortBy)
              if(_task){
                return res.status(200).json({ result: _task, msg: "Success"});
              }
          }
        
    } catch (err) {
          console.log(err)
          res.status(500).json({ result: err, msg: "Error"});
    }
}

async taskDetails(req, res) {
  try {
    let {taskId} = req.body;
    if(!taskId) {
      return res.status(201).json({ result: "Data Missing", msg: "Error"});
    } else {
      let taskStatus = await statusModel.find({taskId})
      let taskComments = await commentModel.find({entityId: taskId})
      if(taskStatus && taskComments) {
        return res.status(200).json({ result: {taskStatus, taskComments}, msg: "Success"});
      } else {
        return res.status(201).json({ result: "Not Found", msg: "Error"});
      }
    }
  } catch (err) {
        console.log(err)
        res.status(500).json({ result: err, msg: "Error"});
  }
}

  async createTask(req, res) {
    try {
      let { title, desc, standupId, labels, taskSeries, lastTaskId, assignee, due, organisationId} = req.body
      console.log(title, desc, standupId, labels, taskSeries, assignee, due)
      if(!title || !desc || !standupId || !labels || !taskSeries || !organisationId) {
        return res.status(201).json({ result: "Data Missing", msg: "Error"});
      } else {
        let _org = await organisationModel.findOne({_id: mongoose.Types.ObjectId(organisationId)})
        let _standup = await standupModel.findOne({_id: mongoose.Types.ObjectId(standupId)})
        if(_org.plan.taskPerStandup <= _standup.lastTaskId) {
          return res.status(201).json({ result: "Plan Exceeds", msg: "Error"});
        } else {
          let mainTaskId = createTaskId(taskSeries, lastTaskId)
          let [ a, displayTaskId] = mainTaskId.split('.')
          let _assignee = {};
          let _users;
          let _newTask = {};
          let memberSetup = new Promise((resolve, reject) => {
            if(!assignee) {
              _assignee = null
              resolve();
            } else {
              _users = [assignee.details];
              _assignee = {
                name: assignee.name,
                details: assignee.details
              }
            }
            resolve();
          })
          memberSetup.then(() => {
            if(!due){
              _newTask = {
                title,
                desc,
                taskId: mainTaskId, //calculate unique
                displayTaskId,
                assignee: _assignee,
                userId: req.user._id,
                userName: req.user.name,
                standupId,
                labels,
                start: new Date(),
              }
            } else {
              _newTask = {
                title,
                desc,
                taskId: mainTaskId, //calculate unique
                displayTaskId,
                assignee: _assignee,
                userId: req.user._id,
                userName: req.user.name,
                standupId,
                labels,
                start: new Date(),
                due
              }
            }
            let _task = new taskModel(_newTask);
            _task
              .save()
              .then(async (created) => {
                  if(assignee === null){
                    let _updateStandup = await standupModel.updateOne({_id: standupId}, {$inc: {lastTaskId: 1}, })
                    if(_updateStandup.nModified === 1){
                      activity(created._id, "New Task Created", "Task", null, standupId, null, null, req.user.name)
                      return res.status(200).json({ result: _task, msg: "Success"});
                    }
                  } else {
                    let _updateStandup = await standupModel.updateOne({_id: standupId, "members.user.details": assignee.details}, {$inc: {lastTaskId: 1, "members.$.performance.inProgress": 1}, })
                    if(_updateStandup.nModified === 1){
                      // setPerformance()
                      activity(created._id, "New Task Assigned", "Task", _users, standupId, null, null, req.user.name)
                      return res.status(200).json({ result: _task, msg: "Success"});
                    }
                  }
  
                
              })
          })
        }
      }
    } catch (err) {
      console.log(err)
      return res.status(500).json({ result: err, msg: "Error"});
    }
  }

  async editTask(req, res) {
    try {
        let {taskId} = req.body;
          if(!taskId) {
            return res.status(201).json({ result: "Data Missing", msg: "Error"});
          } else {
            const updateOps = {};
            for(const ops of req.body.data){
                updateOps[ops.propName] = ops.value;
            }
            let _task = await taskModel.updateOne({_id: taskId}, {
                $set: updateOps
            });
            console.log(updateOps)
            if(_task.modifiedCount === 1) {
            return res.status(200).json({ result: "Updated", msg: "Success" });
            } else {
                return res.status(201).json({ result: "Not Found", msg: "Error"});
            }
          }
    } catch (err) {
      console.log(err)
      return res.status(500).json({ result: err, msg: "Error"});
    }
  }

  async changeProgress(req, res) {
    try {
        let {taskId, progress} = req.body;
          if(!taskId || !progress) {
            return res.status(201).json({ result: "Data Missing", msg: "Error"});
          } else {
            let set;
            let currentDate = new Date();
            let foundTask = await taskModel.aggregate([
              {$match: {_id: new mongoose.Types.ObjectId(taskId)}},
              {$lookup: {
                  from: 'standups',
                  localField: 'standupId',
                  foreignField: '_id',
                  as: 'standupDetails'
                  }
               },
            ])
            // console.log(foundTask)
            let efficiency;
            let totalTimeTaken;
            console.log( foundTask[0].userId.equals(req.user._id))
            if(foundTask[0]) {
              if(progress === "Done"){
                if(foundTask[0].userId.equals(req.user._id)){
                  set = {
                    status: progress,
                    end: currentDate,
                    timeTaken: convertSeconds(foundTask[0].start, currentDate),
                    doneBy: "User"           
                   }
                } else {
                  set = {
                    status: progress,
                    end: currentDate,
                    timeTaken: convertSeconds(foundTask[0].start, currentDate),
                    doneBy: "Admin"        
                   }
                }
              } else {
                set = {
                  status: progress,
                  timeTaken: null
                }
              }
              let _task = await taskModel.updateOne({_id: new mongoose.Types.ObjectId(taskId)}, {
                  $set: set
              });

              let efficiencySetup = new Promise((resolve, reject) => {

                foundTask[0].standupDetails[0].members.forEach((member, index) => {
                  if(foundTask[0].userId.equals(req.user._id) && progress === "Done"){
                    // console.log(member)
                    let totalTaskDone = member.performance.completed + 1
                    totalTimeTaken = member.performance.totalTimeTaken + convertSeconds(foundTask[0].start, currentDate)
                    let totalDaysTaken = convertDays(totalTimeTaken)
                    if(totalDaysTaken === 0) {
                      totalDaysTaken = 1
                    }
                    console.log(totalDaysTaken, totalTaskDone, totalTimeTaken)
                    efficiency = Math.round(totalTaskDone/totalDaysTaken)
                  } else  if(foundTask[0].userId.equals(req.user._id) && progress === "In Progress"){
                    let totalTaskDone = member.performance.completed - 1
                    totalTimeTaken = member.performance.totalTimeTaken - convertSeconds(foundTask[0].start, currentDate)
                    if(totalDaysTaken === 0) {
                      totalDaysTaken = 1
                    }
                    let totalDaysTaken = convertDays(totalTimeTaken)
                    efficiency = Math.round(totalTaskDone/totalDaysTaken)
                  }
                  if (index === foundTask[0].standupDetails[0].members.length -1) resolve();
                })
            })

            efficiencySetup.then(async() => {
              console.log(efficiency)
              if(_task.nModified === 1) {

                if(progress === "Done" && set.doneBy === "User") {
                  console.log("a")
                  let _updateStandup = await standupModel.updateOne({_id: foundTask[0].standupId, "members.user.details": foundTask[0].assignee.details}, {$inc: {"members.$.performance.completed": 1, "members.$.performance.inProgress": -1}, $set: {"members.$.performance.efficiency": efficiency, "members.$.performance.totalTimeTaken": totalTimeTaken}})
                  if(_updateStandup.nModified === 1) {
                    return res.status(200).json({ result: "Updated", msg: "Success" });
                  }
                } else if (progress === "Done" && set.doneBy === "Admin") {
                  console.log("b")
                  let _updateStandup = await standupModel.updateOne({_id: foundTask[0].standupId, "members.user.details": foundTask[0].assignee.details}, {$inc: {"members.$.performance.inProgress": -1}})
                  if(_updateStandup.nModified === 1) {
                    return res.status(200).json({ result: "Updated", msg: "Success" });
                  }
                } else if (progress === "In Progress") {
                  console.log("c")
                  let _updateStandup = await standupModel.updateOne({_id: foundTask[0].standupId, "members.user.details": foundTask[0].assignee.details}, {$inc: {"members.$.performance.completed": -1, "members.$.performance.inProgress": 1}, $set: {"members.$.performance.efficiency": efficiency, "members.$.performance.totalTimeTaken": totalTimeTaken}})
                  if(_updateStandup.nModified === 1) {
                    return res.status(200).json({ result: "Updated", msg: "Success" });
                  }
                }
              } else {
                  return res.status(201).json({ result: "Not Found", msg: "Error"});
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

    async deleteTask(req, res) {
        try {
            let {taskId} = req.body;
            if(!taskId) {
                return res.status(201).json({ result: "Data Missing", msg: "Error"});
            } else {
                let _task = await taskModel.remove({_id: taskId})
                if(_task.deletedCount === 1) {
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

    async assignTask(req, res) {
      try {
          let {standupId, taskId, assignee} = req.body;
          if(!standupId || !taskId || !assignee) {
              return res.status(201).json({ result: "Data Missing", msg: "Error"});
          } else {
              let _task = await taskModel.updateOne({_id: taskId}, {$set: assignee})
              if(_task.deletedCount === 1) {
                let _updateStandup = await standupModel.updateOne({_id: standupId, "members.user.details": assignee.details}, {$inc: {"members.$.performance.inProgress": 1}})
                if(_updateStandup.nModified === 1) {
                  return res.status(200).json({ result: "Assigned", msg: "Success" });
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
}

const taskController = new Task();
module.exports = taskController;
