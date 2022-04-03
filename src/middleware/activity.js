const {activityModel} = require("../models/activity");
const {standupModel} = require("../models/standup")
const {taskModel} = require("../models/task")
const { userModel } = require("../models/user");
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken");

module.exports.activity = function (itemId, title, schema, users, standupId, entityId, collectionName, userName) {
    try {
        if(!standupId && !entityId && !collectionName) { //standup Creation 
            let _activity = new activityModel({
                itemId,
                title,
                schema,
                users,
                userName
              });
              _activity
                .save()
                .then(()=> {
                    console.log("standup notifications Send")
                })
        } else if (!users && ! entityId && !collectionName) { // Task Creation
            let users1 = []

            let usersSetup =  new Promise((resolve, reject) => {
                standupModel.findOne({_id: mongoose.Types.ObjectId(standupId)})
                .then((standup) => {
                    standup.members.forEach( async (member, index) => {
                        users1.push(member.user.details._id)
                        if (index === standup.members.length -1) resolve();
                    })
                })
            })

            usersSetup.then(() => {
                let _activity = new activityModel({
                    itemId,
                    title,
                    schema,
                    users: users1,
                    userName
                  });
                  _activity
                    .save()
                    .then(()=> {
                        console.log("Task Notification send")
                    })
            })
        } else if (!users && !standupId) { //on Comment
            if(collectionName === "Task"){
                let users2 = []
                taskModel.findOne({_id: entityId})
                .then((task) => {
                        users2.push(task.userId)
                        let _activity = new activityModel({
                            itemId,
                            title,
                            schema,
                            users: users2,
                            userName
                          });
                          _activity
                            .save()
                            .then(()=> {
                                console.log("Comment notifications Send to Task user")
                            })
                    
                })
            } else if (collectionName === "User") {
                        let _activity = new activityModel({
                            itemId,
                            title,
                            schema,
                            users: entityId,
                            userName
                          });
                          _activity
                            .save()
                            .then(()=> {
                                console.log("Comment notifications Send to Status User")
                            })
            }
           
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({ result: err, msg: "Error"});
    }
}