const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const taskType = ['Epic', 'Bug', 'Blocker'];

const statusSchema = new mongoose.Schema(
  {
    standupId: {type: ObjectId, ref: "Standup", require: true},
    userId: {type: ObjectId, ref: "User", require: true},
    task: {},
    status: {},
  },
  { timestamps: true }
);


const Status = mongoose.model("Status", statusSchema);
module.exports = Status;
