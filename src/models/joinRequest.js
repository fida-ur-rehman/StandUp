const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const joinRequestSchema = new mongoose.Schema(
  {
    organisationId: {type: ObjectId, ref: "Organisation", require: true},
    userId: {type: ObjectId, ref: "User", require: true},
    userName: {
      type: String,
      require: true
    },
    status: {
        type: String,
        enum: ["PENDING", "ACCEPTED", "REJECTED"],
        default: "PENDING",
        require: true
    },
    text: {
        type: String,
    },
    acceptedBy:{
      userId:  {type: ObjectId, ref: "User"},
      userName: {type: String}
    },
  },
  { timestamps: true }
);


const joinRequestModel = mongoose.model("Joinrequest", joinRequestSchema);
module.exports = {joinRequestModel, joinRequestSchema};
