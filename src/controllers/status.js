const {statusModel} = require("../models/status");
const { commentModel } = require("../models/comment")
const authController = require("../controllers/auth");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose");
const { standupModel } = require("../models/standup");


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
          console.log("A")
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

  async standupUserStatus(req, res) {
    try {
        let { standupId, userId} = req.body;
        if(!standupId || !userId) {
          return res.status(201).json({ result: "Data Missing", msg: "Error"});
        } else {
          let _status = await statusModel.aggregate([
            { $match: 
                {
                  standupId: new mongoose.Types.ObjectId(standupId),
                  userId: new mongoose.Types.ObjectId(userId)
                }
              }
              
          ])

          let _Comment = await commentModel.aggregate([
            { $match: 
              {
                standupId: new mongoose.Types.ObjectId(standupId),
                entityId: new mongoose.Types.ObjectId(userId)
              }
            }
          ])

        console.log(_status)
          if (_status) {
          return res.status(200).json({ result: {_status, _Comment}, msg: "Success"});
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
      let { standupId, taskId, status} = req.body
      if(!standupId || !taskId || !status ) {
        return res.status(201).json({ result: "Data Missing", msg: "Error"});
      } else {
        // console.log(taskId, standupId,status)
          let _status = new statusModel({
            standupId,
            userId: req.user._id,
            userName: req.user.name,
            taskId,
            status
          });
          _status
            .save()
            .then( async (created) => {
              let _standup = await standupModel.findById(standupId)
              if(_standup){
                // if(_standup.members.some((user) => user.userId === req.user._id)) {
                  let updatedStandup = await standupModel.updateOne({_id: standupId, "lastSubmittedBy.userId": req.user._id}, {$set: {"lastSubmittedBy.$.date": created.createdAt}})
                  let updatedStandup1 = await standupModel.updateOne({_id: standupId,  "lastSubmittedBy": {"$not": {"$elemMatch": {"userId": req.user._id}}}}, {$addToSet: {lastSubmittedBy: {userId: req.user._id, date: created.createdAt}}})
                // } 
                console.log(updatedStandup.nModified, updatedStandup1.nModified)
                if(updatedStandup.nModified ===1 || updatedStandup1.nModified ===1) {
                  return res.status(200).json({ result: created, msg: "Success"});
                } 
              }
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
            for(const ops of req.body.data){
                updateOps[ops.propName] = ops.value;
            }
            let _status = await statusModel.updateOne({_id: statusId}, {
                $set: updateOps
            });
            console.log(updateOps)
            if(_status.nModified === 1) {
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
                if(_status.deletedCount === 1) {
                    return res.status(200).json({ result: "Deleted", msg: "Success" });
                } else {
                    return res.status(201).json({ result: "Not Deleted", msg: "Error"});
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
