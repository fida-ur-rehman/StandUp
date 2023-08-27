const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const {userSchema} = require("../models/user")
const {taskSchema} = require("../models/task")

const taskType = ['Epic', 'Bug', 'Blocker'];

const statusSchema = new mongoose.Schema(
  {
    standupId: {type: ObjectId, ref: "Standup", require: true},
    userId: {type: ObjectId, ref: "User", require: true},
    userName: {type: String, require: true, default: "No Name"},
    taskId: {type: ObjectId, ref: "Task"},
    status: {},
    comments: []
  },
  { timestamps: true }
);


const statusModel = mongoose.model("Status", statusSchema);
module.exports = {statusModel, statusSchema};
