/* This all of are helper function */
const {userModel} = require("../models/user");

exports.toTitleCase = function (str) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

exports.validateEmail = function (mail) {
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
    return true;
  } else {
    return false;
  }
};

exports.validatePhoneNumber = function (phoneNumber) {
  if (/^([+][9][1]|[9][1]|[0]){0,1}([7-9]{1})([0-9]{9})$/.test(phoneNumber)) {
    return true;
  } else {
    return false;
  }
};

exports.emailCheckInDatabase = async function (email) {
  let user = await userModel.findOne({ email: email });
  user.exec((err, data) => {
    if (!data) {
      return false;
    } else {
      return true;
    }
  });
};

exports.phoneNumberCheckInDatabase = async function (phoneNumber) {
  let user = await userModel.findOne({ phoneNumber: phoneNumber });
    if (user) {
      return true;
    } else {
      return false;
    }
  
};

exports.userInDatabase = async function (mobileNo) {
  let user = await userModel.findOne({ mobileNo: mobileNo });
    if (user) {
      return true;
    } else {
      return false;
    }
  
};


