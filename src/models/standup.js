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
    organisationId: {type: ObjectId, ref: "Organisation", require: true},
    teamName: {
        type: String,
        require: true
    },
    members: [
        { 
            user: {
                role: {type: String, enum: userRoles, default: "Participants"},
                details: {type: ObjectId, ref: "User", require: true}},
                performance: {
                  completed: {type: Number, default: 0},
                  inProgress: {type: Number, default: 0},
                  totalTimeTaken: {type: Number, default: 0},
                  efficiency: {type: Number, default: 0},
                  submissionRate: {type: Number, default: 0},
                  statusSubmitted: {type: Number, default: 0}
                }
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
      occurrence: {

      },
      inWord: {
          type: String,
          require: true,
          default: "No Occurrence"
        },
      occured: {type: Number, default: 0},
      key: {type: String},
      lastTaskId: {type: Number, default: 0},
      start: {
          type: Date,
          require: true
      },
      end: {
          type: Date,
      },
      lastSubmittedBy: [{
        userId: {type: ObjectId, ref: "User", require: true},
        date: {type: Date}
      }],
      jira: {
        type: Boolean,
        default: false
      },
      export: {
      type: Boolean,
      default: false
      },
    },
  { timestamps: true }
);


const standupModel = mongoose.model("Standup", standupSchema);
module.exports = {standupModel, standupSchema};
