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
    joiningId: {
      type: String,
      require: true
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
    },
    createdBy:  {type: ObjectId, ref: "User", require: true},
    creation: {
      type: String,
      enum: ["Admin", "Self"],
      require: true,
      default: "Self"
    }

  },
  { timestamps: true }
);


const organisationModel = mongoose.model("Organisation", organisationSchema);
module.exports = {organisationModel, organisationSchema};
