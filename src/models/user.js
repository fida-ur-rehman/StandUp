const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const roles = ['user', 'admin'];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      match: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
    },
    // mobileNo: {
    //   type: String,
    //   unique: true ,
    //   require: true,
    // },
    role: {
      type: String,
      enum: roles,
      default: 'user',
      require: true,
    },
    organisation: {
      type: String,
      require: true
    },
    designation: {
      type: String,
      require: true
    },
    pin: {
      type: String,
      default: null
      // require: true
    }
  },
  { timestamps: true }
);


const User = mongoose.model("User", userSchema);
module.exports = User;
