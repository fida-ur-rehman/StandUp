const {standupModel} = require("../models/standup");
const {userModel} = require("../models/user")
const {activity} = require("../middleware/activity")
const cron = require('node-cron');

// Active and Inactive Job
cron.schedule('* * * * * *', () => {
    console.log('running a task every minute');
  });