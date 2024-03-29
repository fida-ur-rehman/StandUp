const mongoose = require("mongoose");
const { organisationSchema } = require("./organisation");
const { ObjectId } = mongoose.Schema.Types;

const roles = ['User', 'Admin'];

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
    verified: {type: Boolean, default: false},
    role: {
      type: String,
      enum: ['User', 'Admin'],
      default: 'User',
      require: true,
    },
    roleType: {
      type: String,
      enum: ["NORMAL", "SUPER"],
      default: "NORMAL",
      require: true
    },
    company: {
      type: String,
      require: true
    },
    title: {
      type: String,
      require: true
    },
    img: {
      type: String,
      default: null
    },
    pin: {
      type: String,
      default: null
      // require: true
    },
    password: {
      type: String,
      default: null
      // require: true
    },
    jira: {
      email: {type: String},
      baseUrl: {type: String},
      accessToken: {type: Object}
    },
    organisations: [{
      organisationId: {type: ObjectId, ref: "Organisation", require: true},
      role: {
        type: String,
        enum: ["MEMBER", "ADMIN", "OWNER"],
        default: "MEMBER"
      },
      permissions: [{type: String, enum: ["STANDUP-CREATOR"]}]
    }],
    createdBy: {type: ObjectId, ref: "User", require: true, default: null}
  },
  { timestamps: true }
);


const userModel = mongoose.model("User", userSchema);
module.exports = {userModel, userSchema};
