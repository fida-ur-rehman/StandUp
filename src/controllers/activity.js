// const Conversation = require("../models/conversation");
const {activityModel} = require("../models/activity");
const User = require("../models/user");

const jwt = require("jsonwebtoken");

class Activity {

    async allActivities(req, res) {
        try {
            await activityModel.find()
            .sort({ _id: -1 })
            .then((_activity) => {
                return res.status(200).json({ result: _activity, msg: "Success"});
            })
          } catch (err) {
            console.log(err)
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }

    async userActivities(req, res) {
      try {
          await activityModel.find({users: {$in: req.user._id}})
          .sort({ _id: -1 })
          .then((_activities) => {
              // console.log(_activities)
              return res.status(200).json({ result: _activities, msg: "Success"});
          })
        } catch (err) {
          console.log(err)
          return res.status(500).json({ result: err, msg: "Error"});
        }
  }

  async deleteActivity(req, res) {
    try {
      let {activityId} = req.body;
      if(!activityId){
        return res.status(500).json({ result: "Data Missing", msg: "Success"});
      } else {
        await activityModel.updateOne({_id: activityId}, {$pull: {users: req.user._id}})
        .then((_activity) => {
            console.log(_activity)
            return res.status(200).json({ result: "Deleted", msg: "Success"});
        })
        }
      } catch (err) {
        console.log(err)
        return res.status(500).json({ result: err, msg: "Error"});
      }
}

  
}

const activityController = new Activity();
module.exports = activityController;