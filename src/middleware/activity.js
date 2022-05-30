const {activityModel} = require("../models/activity");
const {standupModel} = require("../models/standup")
const {taskModel} = require("../models/task")
const { userModel } = require("../models/user");
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken");

const {sendMessage} = require("../../socket");

module.exports.activity = async function (itemId, title, schema, users, standupId, entityId, collectionName, userName) {
    console.log("inside Activity")
    try {
        console.log(itemId, title, schema, users, standupId, entityId, collectionName, userName)
        if(!standupId && !entityId && !collectionName && users.length !== 0) { //standup Creation and // not submitted Status
            console.log("inside Activity 1")
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
                    sendMessage(_activity)
                    console.log("first")
                    // sendMessage(_activity)
                })
        } else if ( !entityId && !collectionName && users.length !== 0) { // Task Creation
            console.log("inside Activity abcd")
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
                    sendMessage(_activity)
                    console.log("seocnd")
                    // sendMessage(_activity)
                })
        } else if (!users && ! entityId && !collectionName && userName) { // Task Creation
            // console.log("inside Activity 2")
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
                        sendMessage(_activity)
                        console.log("Task Notification send")
                    })
            })
        } else if (!users && ! entityId && !collectionName && !userName) { // Reminder Cron
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
                  });
                  _activity
                    .save()
                    .then(()=> {
                        // console.log("ggg")
                        // console.log(_activity)
                        sendMessage(_activity)
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
                                sendMessage(_activity)
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
                                sendMessage(_activity)
                                console.log("Comment notifications Send to Status User")
                            })
            } else {
                console.log("Something went wrong fron activity module")
            }
           
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({ result: err, msg: "Error"});
    }
}