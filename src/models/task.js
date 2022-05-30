const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const taskStatus = ['To Do', 'In Progress', 'Done'];

const taskSchema = new mongoose.Schema(
  {
    title: {type: String, require: true},
    desc: { type: String, require: true},
    status: {type: String, enum: taskStatus, require: true, default: "To Do"},
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
    timeTaken: {type: String}
  },
  { timestamps: true }
);


const taskModel = mongoose.model("Task", taskSchema);
module.exports = {taskModel, taskSchema};
