
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
const PaytmChecksum = require("./PaytmChecksum")
const formidable  = require('formidable')
require("dotenv").config()

const jiraConnect = require("./atlassian-connect.json")

// const helloworld = require("./public/helloworld.html")

//CONSTANTS
const { socketConnection } = require('./socket');
const app = express()
const Server = require('http').Server(app);
socketConnection(Server);
const port = process.env.PORT || 3005

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
app.use("/api/dashboard", require("./src/routes/dashboard"));
app.use("/api/joinReq", require("./src/routes/joinRequest"));



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



  app.post("/paytmpayment",(req,res)=>{ //you get array buffer when you use wrong credentials
    console.log(req.body.product)
    
    var params = {};
    
    /* initialize an array */
    params['MID'] =`FtKqkv93523091701859`//"XWGwMl59443376078143"//process.env.PAYTM_MID;
    params['WEBSITE'] = 'WEBSTAGING'; //DEFAULT
    params['CHANNEL_ID'] = 'WEB';
    params['INDUSTRY_TYPE_ID'] = 'Retail';
    params['ORDER_ID'] = `EWF_${Math.floor(1000 + Math.random() * 9000)}`;
    params['CUST_ID'] = `EWF_10${req.body.email.replace("@gmail.com","")}`;
    params['TXN_AMOUNT'] = `100`;
    params['CALLBACK_URL'] = `http://localhost:3002/callback`; //https://securegw-stage.paytm.in/theia/paytmCallback
    params['EMAIL'] = `${req.body.email}`;
    params['MOBILE_NO'] = "";
    //XWGwMl59443376078143
    //&KFtiFfi681&77if
    /**
     * https://securegw-stage.paytm.in/
    * Generate checksum by parameters we have
    * Find your Merchant Key in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys 
    */
    var paytmChecksum = PaytmChecksum.generateSignature(params,"%O6UAbLadsQpE2ue" );//process.env.MERCHENT_KEY
    paytmChecksum.then(function(checksum){
   //   console.log(checksum)
      //var isVerifySignature = PaytmChecksum.verifySignature(params,"%O6UAbLadsQpE2ue" , checksum);
//      console.log(isVerifySignature)
    let paytmParams={
        ...params,
        "CHECKSUMHASH":checksum
    }
    res.json(paytmParams)
    }).catch(function(error){
      console.log(error);
    });
    
    })



    app.post("/callback",(req,res)=>{
      const form = new formidable.IncomingForm()
      console.log("inside callback",form)
      form.parse(req,async (err,fields,file)=>{
        console.log("inside form pass",fields)
  if(err){
      console.log(err)
  }
  paytmChecksum = fields.CHECKSUMHASH;
  delete fields.CHECKSUMHASH;
  //merchant id kupXTo83613795537613
  //merchant key KcD6HXTx4gx%r4hl
  //test key KcD6HXTx4gx%r4hl
  var isVerifySignature = PaytmChecksum.verifySignature(fields,"%O6UAbLadsQpE2ue" , paytmChecksum);
  if (isVerifySignature) {
  console.log(fields)
  res.send("Succes")
  }
  })

    })
  
//LISTEN
Server.listen(port, () => {
  console.log(`Running on port http://localhost:${port}`)
})


// Log =>  {"eventType":"NOT_TXN_STATUS_FORM_SUBMITTED","FORM_URI":"http%3A%2F%2Flocalhost%3A3002%2Fcallback","message":"Form Not Submitted also after 5 seconds threshold","debug":true,"env":"txnStatus","pageUrl":"https://securegw-stage.paytm.in/theia/v1/transactionStatus?id=20220903111212800110168246904020497","v":"v0","mid":"FtKqkv93523091701859","orderId":"EWF_1662223602029","width":1599,"height":937,"time":1662223654776,"tzOffset":-330,"iso":"2022-09-03T16:47:34.776Z","network":"4g","userAgent"