const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const collections = ['Task', 'User'];

const organisationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true
    },
    owner: {
      type: String, ref: "User", require: true
    },
    admins: [{type: String, ref: "User", require: true}],
    status: {
        type: String,
        require: true,
        enum: ["Active", "InActive"],
        default: "Active"
    },
    domain: {
        type: String,
        require: true
    },
    teams: [{type: ObjectId, ref: "Team", require: true}],
    plan: {},
    payment: {},
    verified: {
      type: Boolean,
      default: false,
      require: true
    }
  },
  { timestamps: true }
);


const organisationModel = mongoose.model("Organisation", organisationSchema);
module.exports = {organisationModel, organisationSchema};
