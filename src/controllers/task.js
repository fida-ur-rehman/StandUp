const {taskModel} = require("../models/task");
const mongoose = require("mongoose")
const {activity} = require("../middleware/activity")
const shortid = require("shortid");
const {createTaskId} = require("../middleware/createTaskId")
const {userModel } = require("../models/user");
const { standupModel } = require("../models/standup");
const { commentModel } = require("../models/comment");
const { statusModel } = require("../models/status");
const moment = require("moment")
// function createTaskId(taskSeries, lastTaskId){
//   let _lastTaskId = lastTaskId + 1
//   let mainId = taskSeries + '-' +  _lastTaskId 
//   return mainId;
// }

var startDate = new Date('2022-05-30T04:17:55.769+0530');
var endDate = new Date('2022-06-30T04:20:55.769+0530');
var t1 = new Date('2022-05-30T04:17:55.769+0530');
var t2 = new Date('2022-05-31T04:17:55.769+0530');
var dif = t2.getTime() - t1.getTime();

console.log(dif/1000)

console.log()
let _seconds = Math.abs((endDate.getTime()-startDate.getTime()) /1000 )

function secondsToDhms(seconds) {
  seconds = Number(seconds);
  var d = Math.floor(seconds / (3600*24));
  var h = Math.floor(seconds % (3600*24) / 3600);
  var m = Math.floor(seconds % 3600 / 60);
  var s = Math.floor(seconds % 60);
  
  var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
  var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
  var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
  var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
  return dDisplay + hDisplay + mDisplay + sDisplay;
  }

  console.log(secondsToDhms(_seconds))

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
      let { title, desc, standupId, labels, taskSeries, lastTaskId, assignee, due} = req.body
      if(!title || !desc || !standupId || !labels || !taskSeries || !lastTaskId) {
        return res.status(201).json({ result: "Data Missing", msg: "Error"});
      } else {
        let mainTaskId = createTaskId(taskSeries, lastTaskId)
        let [ a, displayTaskId] = mainTaskId.split('.')
        let _assignee = {};
        let _users = [assignee.details];
        let _newTask = {};
        let memberSetup = new Promise((resolve, reject) => {
          if(!assignee) {
            _assignee = null
            resolve();
          } else {
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
              let _updateStandup = await standupModel.updateOne({_id: standupId}, {$inc: {lastTaskId: 1}})
              if(_updateStandup.nModified === 1){
                if(assignee === null){
                  activity(created._id, "New Task Created", "Task", null, standupId, null, null, req.user.name)
                } else {
                  activity(created._id, "New Task Assigned", "Task", _users, standupId, null, null, req.user.name)
                }
                return res.status(200).json({ result: _task, msg: "Success"});
              }
            })
        })
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
            let set;;
            if(progress === "Done"){
              set = {
                status: progress,
                end: new Date()
              }
            } else {
              set = {
                status: progress
              }
            }
            let _task = await taskModel.updateOne({_id: taskId}, {
                $set: set
            });
        
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
}

const taskController = new Task();
module.exports = taskController;
