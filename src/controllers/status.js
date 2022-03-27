const taskModel = require("../models/task");
const authController = require("../controllers/auth");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose");


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
            if (_task) {
            return res.status(200).json({ result: _task, msg: "Success"});
            }
          }
      } catch (err) {
            console.log(err)
            res.status(500).json({ result: err, msg: "Error"});
      }
  }

  async craeteTask(req, res) {
    try {
      let { title, desc, taskId, taskType} = req.body
      if(!title || !desc || !taskId || taskType) {
        return res.status(201).json({ result: "Data Missing", msg: "Error"});
      } else {
          let _task = new taskModel({
            title,
            desc,
            taskId, //calculate unique
            userId: req.user._id,
            taskType
          });
          _task
            .save()
            .then((created) => {
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
            for(const ops of req.body){
                updateOps[ops.propName] = ops.value;
            }
            let _task = await taskModel.updateOne({_id: taskId}, {
                $set: updateOps
            });
            console.log(updateOps)
            if(_task) {
            return res.status(200).json({ result: _task, msg: "Success" });
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
                if(_task) {
                return res.status(200).json({ result: _task, msg: "Success" });
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
