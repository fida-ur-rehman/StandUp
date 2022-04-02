const {taskModel} = require("../models/task");
const {activity} = require("../middleware/activity")
const shortid = require("shortid");
const { standupModel } = require("../models/standup");
const { default: mongoose } = require("mongoose");

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
            let _task = await taskModel.findOne({_id: taskId})
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
      let _userStandup = await standupModel.aggregate([
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
      
          // let _task = await taskModel.findOne({_id: taskId})
          // console.log(_task)
          if (_userStandup) {
            let _userStandup1 = _userStandup[0].array
     
              let task = taskModel.find({}, {standupId: new mongoose.Types.ObjectId("6245846302e3437d31c10bbf")})
              if(task){
                console.log(task)
              }
            
              // console.log(_userTask)
          return res.status(200).json({ result: _userStandup, msg: "Success"});
          }
        
    } catch (err) {
          console.log(err)
          res.status(500).json({ result: err, msg: "Error"});
    }
}

  async createTask(req, res) {
    try {
      let { title, desc, standupId, taskType} = req.body
      if(!title || !desc || !standupId || !taskType) {
        return res.status(201).json({ result: "Data Missing", msg: "Error"});
      } else {
          let _task = new taskModel({
            title,
            desc,
            taskId: shortid.generate(), //calculate unique
            userId: req.user._id,
            standupId,
            taskType
          });
          _task
            .save()
            .then((created) => {
                activity(created._id, "New Task", "Task", null, standupId, null, null)
                return res.status(200).json({ result: _task, msg: "Success"});
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
