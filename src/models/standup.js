const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const statusTypes = ['Worked On', 'Working On', 'Blocker'];
const userRoles = ['Admin', 'Watcher', 'Participants'];

const standupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true
    },
    teamName: {
        type: String,
        require: true
    },
    members: [
        { 
            role: {type: String, enum: userRoles, default: "Participants"},
            userId: {type: ObjectId, ref: "User"}
        }
    ],
    statusTypes: {
        type: Array,
        default: statusTypes
    }
  },
  { timestamps: true }
);


const Standup = mongoose.model("Standup", standupSchema);
module.exports = Standup;
