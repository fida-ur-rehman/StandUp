const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const taskType = ['Epic', 'Bug', 'Blocker'];

const statusSchema = new mongoose.Schema(
  {
    standupId: {type: ObjectId, ref: "Standup", require: true},
    task: {},
    status: {
        
    },
    type: {
        type: String,
        enum: taskType,
        require: true
    },
  },
  { timestamps: true }
);


const Status = mongoose.model("Status", statusSchema);
module.exports = Status;
