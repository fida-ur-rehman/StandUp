const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const collections = ['Task', 'Status'];

const commentSchema = new mongoose.Schema(
  {
    standupId: {type: ObjectId, ref: "Standup", require: true},
    userId: {type: ObjectId, ref: "User", require: true},
    userName: {
      type: String,
      require: true
    },
    userImage: {
      type: String,
      require: true,
      default: null
    },
    entityId: {
        type: ObjectId, 
        require: true
    },
    collectionName: {
        type: String,
        enum: collections,
        require: true
    },
    text: {
        type: String,
        require: true
    }
  },
  { timestamps: true }
);


const commentModel = mongoose.model("Comment", commentSchema);
module.exports = {commentModel, commentSchema};
