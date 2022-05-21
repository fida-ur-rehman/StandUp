const mongoose = require("mongoose");
const { userSchema } = require("../models/user")
const { ObjectId } = mongoose.Schema.Types;

// console.log(userSchema)

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
            user: {
                role: {type: String, enum: userRoles, default: "Participants"},
                details: {type: ObjectId, ref: "User", require: true},}
        }
    ],
    statusTypes: {
        type: Array,
        default: statusTypes
    },
    status: {
          type: String,
          enum: ['Not Started', 'Active', "InActive"],
          default: "Not Started",
          require: true
      },
      occurrence: {},
      start: {
          type: Date,
          require: true
      },
      end: {
          type: Date,
      },
      // nextOccurrence: { //Previous Occurred Day
      //   type: Date,
      // }
  },
  { timestamps: true }
);


const standupModel = mongoose.model("Standup", standupSchema);
module.exports = {standupModel, standupSchema};
