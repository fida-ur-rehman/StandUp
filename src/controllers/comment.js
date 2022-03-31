const {commentModel} = require("../models/comment");
const {activity} = require("../middleware/activity")
const mongoose = require("mongoose");
const shortid = require("shortid")

class Comment {
  async allComment(req, res) {
    try {
      let _comment = await commentModel
        .find({})
        .sort({ _id: -1 });
      if (_comment) {
        return res.status(200).json({ result: _comment, msg: "Success"});
      }
    } catch (err) {
        console.log(err)
        return res.status(500).json({ result: err, msg: "Error"});
    }
  }

  async getComment(req, res) {
      try {
          let {commentId} = req.body;
          if(!commentId) {
            return res.status(201).json({ result: "Data Missing", msg: "Error"});
          } else {
            let _comment = await commentModel.findOne({_id: commentId})
            console.log(_comment)
            if (_comment) {
                console.log(_comment)
            return res.status(200).json({ result: _comment, msg: "Success"});
            }
          }
      } catch (err) {
            console.log(err)
            res.status(500).json({ result: err, msg: "Error"});
      }
  }

  async entityComments(req, res) {
    try {
        let {standupId, entityId, collectionName} = req.body;
        if(!standupId || ! entityId || !collectionName) {
          return res.status(201).json({ result: "Data Missing", msg: "Error"});
        } else {
          let _comment = await commentModel.aggregate([
            { $match: 
                {
                  standupId: new mongoose.Types.ObjectId(standupId),
                  entityId: new mongoose.Types.ObjectId(entityId)
                }
              }
          ])
          console.log(_comment)
          if (_comment) {
              console.log(_comment)
          return res.status(200).json({ result: _comment, msg: "Success"});
          //Activity
          }
        }
    } catch (err) {
          console.log(err)
          res.status(500).json({ result: err, msg: "Error"});
    }
}

  

  async creatComment(req, res) {
    try {
      let { entityId, collectionName, standupId, text } = req.body
      if(!entityId || !collectionName || !standupId || !text ) {
        return res.status(201).json({ result: "Data Missing", msg: "Error"});
      } else {
          let _comment = new commentModel({
            standupId,
            userId: req.user._id,
            entityId,
            collectionName,
            text
          });
          _comment
            .save()
            .then((created) => {
                activity(created._id, "New Comment", "Comment", null, null, entityId, collectionName)
                return res.status(200).json({ result: _comment, msg: "Success"});
            })
      }
    } catch (err) {
      console.log(err)
      return res.status(500).json({ result: err, msg: "Error"});
    }
  }

  async editComment(req, res) {
    try {
        let {commentId} = req.body;
          if(!commentId) {
            return res.status(201).json({ result: "Data Missing", msg: "Error"});
          } else {
            const updateOps = {};
            for(const ops of req.body.data){
                updateOps[ops.propName] = ops.value;
            }
            let _comment = await commentModel.updateOne({_id: commentId}, {
                $set: updateOps
            });
            console.log(updateOps)
            if(_comment.modifiedCount === 1) {
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

    async deleteComment(req, res) {
        try {
            let {commentId} = req.body;
            if(!commentId) {
                return res.status(201).json({ result: "Data Missing", msg: "Error"});
            } else {
                let _comment = await commentModel.remove({_id: commentId})
                if(_comment.deletedCount === 1) {
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

const commentController = new Comment();
module.exports = commentController;
