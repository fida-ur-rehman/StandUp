const statusModel = require("../models/status");
const authController = require("../controllers/auth");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose");


class Status {
  async allStatus(req, res) {
    try {
      let _status = await statusModel
        .find({})
        .sort({ _id: -1 });
      if (_status) {
        return res.status(200).json({ result: _status, msg: "Success"});
      }
    } catch (err) {
        console.log(err)
        return res.status(500).json({ result: err, msg: "Error"});
    }
  }

  async getStatus(req, res) {
      try {
          let {statusId} = req.body;
          if(!statusId) {
            return res.status(201).json({ result: "Data Missing", msg: "Error"});
          } else {
            let _status = await statusModel.findOne({_id: statusId})
            if (_status) {
            return res.status(200).json({ result: _status, msg: "Success"});
            }
          }
      } catch (err) {
            console.log(err)
            res.status(500).json({ result: err, msg: "Error"});
      }
  }

  async standupStatusUser(req, res) {
    try {
        let { standupId, userId} = req.body;
        if(!standupId || !userId) {
          return res.status(201).json({ result: "Data Missing", msg: "Error"});
        } else {
          let _status = await statusModel.find({standupId, userId})
          if (_status) {
          return res.status(200).json({ result: _status, msg: "Success"});
          }
        }
    } catch (err) {
          console.log(err)
          res.status(500).json({ result: err, msg: "Error"});
    }
}

async standupStatus(req, res) {
    try {
        let { standupId} = req.body;
        if(!standupId) {
          return res.status(201).json({ result: "Data Missing", msg: "Error"});
        } else {
          let _status = await statusModel.find({standupId})
          if (_status) {
          return res.status(200).json({ result: _status, msg: "Success"});
          }
        }
    } catch (err) {
          console.log(err)
          res.status(500).json({ result: err, msg: "Error"});
    }
}

  async craeteStatus(req, res) {
    try {
      let { title, desc, taskId, taskType} = req.body
      if(!title || !desc || !taskId || taskType) {
        return res.status(201).json({ result: "Data Missing", msg: "Error"});
      } else {
          let _task = new statusModel({
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

  async editStatus(req, res) {
    try {
        let {statusId} = req.body;
          if(!statusId) {
            return res.status(201).json({ result: "Data Missing", msg: "Error"});
          } else {
            const updateOps = {};
            for(const ops of req.body){
                updateOps[ops.propName] = ops.value;
            }
            let _status = await statusModel.updateOne({_id: statusId}, {
                $set: updateOps
            });
            console.log(updateOps)
            if(_status) {
            return res.status(200).json({ result: _status, msg: "Success" });
            }
          }
    } catch (err) {
      console.log(err)
      return res.status(500).json({ result: err, msg: "Error"});
    }
  }

    async deleteStatus(req, res) {
        try {
            let {statusId} = req.body;
            if(!statusId) {
                return res.status(201).json({ result: "Data Missing", msg: "Error"});
            } else {
                let _status = await statusModel.remove({_id: statusId})
                if(_status) {
                return res.status(200).json({ result: _status, msg: "Success" });
                }
            }
        } catch (err) {
        console.log(err)
        return res.status(500).json({ result: err, msg: "Error"});
        }
    }
}

const statusController = new Status();
module.exports = statusController;
