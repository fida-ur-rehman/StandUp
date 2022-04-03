const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const activitySchema = new mongoose.Schema(
  {
    itemId: {
        type: ObjectId
    },
    title: {
        type: String,
        require: true
    },
    schema: {
        type: String,
        enum: ['Standup', "Task", "Comment"],
        require: true
    },
    users: [{type: ObjectId, ref: "User"}],
    userName: {
      type: String,
      require: true
    }
  },
  { timestamps: true }
);


const activityModel = mongoose.model("Activity", activitySchema);
module.exports = {activityModel, activitySchema};