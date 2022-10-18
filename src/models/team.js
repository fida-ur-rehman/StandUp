const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const collections = ['Task', 'User'];

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true
    },
    organisation: {type: ObjectId, ref: "Organisation", require: true},
    members: [{userId: {type: ObjectId, ref: "User", require: true}, email: {type: String, require: true}}],
  },
  { timestamps: true }
);


const teamModel = mongoose.model("Team", teamSchema);
module.exports = {teamModel, teamSchema};
