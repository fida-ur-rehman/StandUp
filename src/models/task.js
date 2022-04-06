const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const taskType = ['Epic', 'Bug', 'Blocker'];

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      require: true
    },
    desc: {
        type: String,
        require: true
    },
    taskId: {type: String, unique:true, require: true},
    userId: {type: ObjectId, ref: "User", require: true},
    userName: {type: String, require: true, default: "no Name"},
    standupId: {type: ObjectId, ref: "Standup", require: true},
    type: {
        type: String,
        enum: taskType,
        require: true
    }
  },
  { timestamps: true }
);


const taskModel = mongoose.model("Task", taskSchema);
module.exports = {taskModel, taskSchema};
