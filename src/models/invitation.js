const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const joinRequestSchema = new mongoose.Schema(
  {
    organisationId: {type: ObjectId, ref: "Organisation", require: true},
    organisationName: {
        type: String,
        require: true
    },
    userEmail: {type: String, require: true},
    invitedBy: {type: ObjectId, ref: "User", require: true},
    invitorName: {
        type: String,
        require: true
    },
    link: {
        type: String,
        require: true
    },
    status: {
        type: String,
        enum: ["PENDING", "JOINED", "EXPIRED"],
        default: "PENDING",
        require: true
    },

  },
  { timestamps: true }
);


const joinRequest = mongoose.model("Joinrequest", joinRequestSchema);
module.exports = {joinRequest, joinRequestSchema};
