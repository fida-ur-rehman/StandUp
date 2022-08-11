//IMPORTS
const express = require('express');

const morgan = require("morgan")
const mongoose = require("mongoose");
const bodyParser = require("body-parser")
const cron = require('node-cron');
const cors = require("cors")
const bcrypt = require("bcrypt")
const crypto = require("crypto")
const Grid = require("gridfs-stream")
require("dotenv").config()

const jiraConnect = require("./atlassian-connect.json")

// const helloworld = require("./public/helloworld.html")

//CONSTANTS
const { socketConnection } = require('./socket');
const app = express()
const Server = require('http').Server(app);
socketConnection(Server);
const port = process.env.PORT || 3002

//MIDDLEWAREs
app.use(cors())
app.use(morgan("dev"))
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json())

//DATABSE CONNECTION
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true,
  })
  .then(() =>{console.log("Mongodb Database Connected Successfully")
})
  .catch((err) => {
    console.log(err)
    console.log("NOT CONNECTED TO DB")
  })

const conn = mongoose.connection

conn.on('error', console.error.bind(console, "Error connecting to db"));

let gfs;
// Grid Stream Intt
conn.once('open', async () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads")
  module.exports = gfs;
})

// Routes
app.use("/api/auth", require("./src/routes/auth"));
app.use("/api/user", require("./src/routes/user"));
app.use("/api/standup", require("./src/routes/standup"));
app.use("/api/task", require("./src/routes/task"));
app.use("/api/status", require("./src/routes/status"));
app.use("/api/comment", require("./src/routes/comment"));
app.use("/api/activity", require("./src/routes/activity"));
app.use("/api/jira", require("./src/routes/jira"));
app.use("/api/export", require("./src/routes/export"));
app.use("/api/plan", require("./src/routes/plan"));
app.use("/api/organisation", require("./src/routes/organisation"));
app.use("/api/team", require("./src/routes/team"));


app.get('/home', (req, res) => {
  res.send('Hello World!')
})

app.get('/atlassian-connect.json', (req, res) => {
  // res.send(jiraConnect)
  res.sendFile(path.join(__dirname, '/atlassian-connect.json'))
})

app.get('/helloworld.html', (req, res) => {
  res.sendFile(path.join(__dirname, '/helloworld.html'))
})

const {standupModel} = require("./src/models/standup")
const {activity} = require("./src/middleware/activity")

const moment = require('moment');

const { RRule, RRuleSet, rrulestr } = require('rrule');
const path = require('path');

function checkIfToday(rruleStr){
  let rule = new RRule(rruleStr);
  // console.log(rule)
  let currentDate1 = new Date()
  let currentDate = new Date(Date.UTC(currentDate1.getUTCFullYear(), currentDate1.getUTCMonth(), currentDate1.getUTCDate(), 00))
  let nextOccurrence    = rule.after(currentDate, true); // next rule date including today
  let nextOccurutc      = moment(nextOccurrence).utc(); // convert today into utc
  let match             = moment(nextOccurutc).isSame(currentDate, 'day'); // check if 'DAY' is same
  return match;
}


// let job = cron.schedule('* * * * * *', () => {
//     standupModel.find()
//     .then((_standups) => {
//       console.log("abcd")
//       _standups.forEach(async (standup, index) => {
//         console.log(index)
//         let occurrence = checkIfToday(standup.occurrence)
        
//         if(standup.status === "Active" && occurrence === true) {
//           // send Notification
//           console.log(index)
//           activity(standup._id, "Reminder For status", "Standup", [], standup._id, null, null, null)
//         }
//       });
//     })
//   });

  // job.start();

//LISTEN
Server.listen(port, () => {
  console.log(`Running on port http://localhost:${port}`)
})
