var jsonexport = require('jsonexport');
const {taskModel} = require("../models/task");
const mongoose = require("mongoose")
const {activity} = require("../middleware/activity")
const shortid = require("shortid");
const { standupModel } = require("../models/standup");
const { commentModel } = require("../models/comment");
const { statusModel } = require("../models/status");

const {encrypt} = require("../middleware/encrypt")
const {decrypt} = require("../middleware/decrypt");
const { userModel } = require("../models/user");
const axios = require("axios");
const { response } = require("express");
const writeFile = require('fs').writeFile;



// let a;
// standupModel.findOne({_id: new mongoose.Types.ObjectId("628a7a82118939686cc3d6c2")})
// .then((_standup) => {
    

// jsonexport(_standup,function(err, csv){
//     if(err) return console.log(err);
//     console.log(csv);
//     writeFile('./test-data.csv', csv, (err) => {
//         if(err) {
//             console.log(err); // Do something to handle the error or just throw it
//             throw new Error(err);
//         }
//         console.log('Success!');
//     });
// });
// })
// // console.log(_standup)
// let contacts = [{
//     name: 'Bob',
//     lastname: 'Smith'
// },{
//     name: 'James',
//     lastname: 'David'
// },{
//     name: 'Robert',
//     lastname: 'Miller'
// },{
//     name: 'David',
//     lastname: 'Martin'
// }];



// Text send to encrypt function
// var hw = encrypt("Welcome to Tutorials Point...", process.env.SECRET)
// console.log(hw)
// console.log(decrypt(hw, process.env.SECRET))

// const usernamePasswordBuffer = Buffer.from("techgeeksfs@gmail.com" + ':' + process.env.A);
// const base64data = usernamePasswordBuffer.toString('base64');

// let a = axios.get("http://techgeeksfs.atlassian.net/rest/api/2/issue/STAN-1", {headers: { 
//     'Authorization': `Basic ${base64data}`
//   }})
// a.then((response) => {
//     console.log(response.data.fields.labels[0])
// })

class Jira {
    
  async signIn(req, res) {
    try {
        let {email, baseUrl, accessToken} = req.body;
        if(!email, baseUrl, accessToken) {
          return res.status(201).json({ result: "Data Missing", msg: "Error"});
        } else {
            const usernamePasswordBuffer = Buffer.from(email + ':' + accessToken);
            const base64data = usernamePasswordBuffer.toString('base64');
            let accessTokenE = encrypt(accessToken, process.env.SECRET)
            let _user = await userModel.updateOne({_id: req.user._id}, {$set: {jira: {email, baseUrl, accessTokenE}}})
            let checkData = axios.get(`http://${baseUrl}.atlassian.net/rest/api/2/issue/createmeta`, {headers: { 
            'Authorization': `Basic ${base64data}`
          }})
          checkData.then((response) => {
            if (_user && response.status === 200) {
                return res.status(200).json({ result: "Updated", msg: "Success"});
              } else {
                return res.status(201).json({ result: "Please Enter Valid Details", msg: "Error"});
              }
            })
        }
    } catch (err) {
          console.log(err)
          res.status(500).json({ result: err, msg: "Error"});
    }
  }
}

const jiraController = new Jira();
module.exports = jiraController;
