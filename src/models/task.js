const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const taskStatus = ['In Progress', 'Done'];

const taskSchema = new mongoose.Schema(
  {
    title: {type: String, require: true},
    desc: { type: String, require: true},
    status: {type: String, enum: taskStatus, require: true, default: "In Progress"},
    organisationId: {type: ObjectId, ref: "Organisation", require: true},
    taskId: {type: String, unique:true, require: true},
    displayTaskId: {type: String, require: true},
    jiraId: {type: String, default: null},
    userId: {type: ObjectId, ref: "User", require: true},
    userName: {type: String, require: true, default: "no Name"},
    standupId: {type: ObjectId, ref: "Standup", require: true},
    assignee: {name: {type: String}, details: {type: ObjectId, ref: "User", require: true}},
    labels: [{type:String}],
    start: {type: Date,require: true},
    end: {type: Date},
    due: {type: Date},
    doneBy: {type: String, enum: ["User", "Admin", null], default: null},
    timeTaken: {type: Number, default: null}
  },
  { timestamps: true }
);


const taskModel = mongoose.model("Task", taskSchema);
module.exports = {taskModel, taskSchema};
