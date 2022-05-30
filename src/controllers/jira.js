const {taskModel} = require("../models/task");
const mongoose = require("mongoose")
const {activity} = require("../middleware/activity")
const {createTaskId} = require("../middleware/createTaskId")
const shortid = require("shortid");

const { standupModel } = require("../models/standup");
const { commentModel } = require("../models/comment");
const { statusModel } = require("../models/status");

const {encrypt} = require("../middleware/encrypt")
const {decrypt} = require("../middleware/decrypt");
const { userModel } = require("../models/user");
const axios = require("axios");
// const moment = require("moment")
// var d = new Date('2022-05-30T04:17:55.769+0530').toISOString()
// console.log('IST: ',  d)



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

  async searchIssue(req, res) {
      try {
          let {issueId} = req.body;
          let {jira} = req.user
          if(!issueId) {
            return res.status(201).json({ result: "Data Missing", msg: "Error"});
          } else {
            if(!jira.baseUrl || !jira.email || !jira.accessToken) {
                return res.status(201).json({ result: "Please Sign in with Jira", msg: "Error"});
            } else {
                let accessTokenD = decrypt(jira.accessToken, process.env.SECRET)
                const usernamePasswordBuffer = Buffer.from(jira.email + ':' + accessTokenD);
                const base64data = usernamePasswordBuffer.toString('base64');
                let _issue = axios.get(`http://${jira.basUrl}.atlassian.net/rest/api/2/issue/${issueId}`, {headers: { 
                    'Authorization': `Basic ${base64data}`
                }})
                _issue.then((response) => {
                    if(response.status === 200) {
                        let newIssue = {
                            title: response.data.fields.summary,
                            desc: response.data.fields.description,
                            taskId: response.data.key,
                            userName: response.data.fields.creator.displayName,
                            taskType: response.data.fields.labels
                        }
                        return res.status(200).json({ result: newIssue, msg: "Success"});
                    } else {
                        return res.status(201).json({ result: response.errorMessages[0], msg: "Error"});
                    }
                })
            }
          }
      } catch (err) {
            console.log(err)
            res.status(500).json({ result: err, msg: "Error"});
      }
  }

  async importIssue(req, res) {
    try {
        let {issueId, standupId} = req.body;
        let {jira} = req.user
        if(!issueId, !standupId) {
          return res.status(201).json({ result: "Data Missing", msg: "Error"});
        } else {
            if(!jira.baseUrl || !jira.email || !jira.accessToken) {
                return res.status(201).json({ result: "Please Sign in with Jira", msg: "Error"});
            } else {
                let accessTokenD = decrypt(jira.accessToken, process.env.SECRET)
                const usernamePasswordBuffer = Buffer.from(jira.email + ':' + accessTokenD);
                const base64data = usernamePasswordBuffer.toString('base64');
                let _issue = axios.get(`http://${jira.basUrl}.atlassian.net/rest/api/2/issue/${issueId}`, {headers: { 
                    'Authorization': `Basic ${base64data}`
                }})
                let mainTaskId = createTaskId(taskSeries, lastTaskId)
                let [ a, displayTaskId] = mainTaskId.split('.')
                let _assignee = [];
                let _users = [];
                let _notMember = [];
                let memberSetup = new Promise( async (resolve, reject) => {
                    if(response.data.fields.assignee === null) {
                      _assignee = null
                      resolve();
                    } else {
                        let user = await userModel.findOne({email: response.data.fields.assignee.emailAddress})
                          if(!user || user === null){
                              _notMember.push(member)
                          } else {
                              let userDoc = {
                                  user: {
                                    name: user.name,
                                    details: user._id
                                  }
                              }
                              _assignee.push(userDoc)
                              _users.push(user._id)
                          }
                        resolve();
                    }
                  })

                  memberSetup.then(() => {
                    _issue.then((response) => {
                        if(response.status === 200) {
                            let _task = new taskModel({
                                title: response.data.fields.summary,
                                desc: response.data.fields.description,
                                taskId: mainTaskId, //calculate unique
                                userId: req.user._id,
                                userName: req.user.name,
                                standupId,
                                labels: response.data.fields.labels,
                                assignee: _assignee,
                                status: response.data.fields.labels.status.name,
                                jiraId: response.data.id,
                                displayTaskId,
                                start: new Date(response.data.fields.created).toISOString()
                              });
                              _task
                                .save()
                                .then((created) => {
                                    if(_assignee === null){
                                        activity(created._id, "New Task Created", "Task", null, standupId, null, null, req.user.name)
                                      } else {
                                        activity(created._id, "New Task Assigned", "Task", _users, standupId, null, null, req.user.name)
                                      }
                                    return res.status(200).json({ result: _task, msg: "Success"});
                                })
                        } else {
                            return res.status(201).json({ result: response.errorMessages[0], msg: "Error"});
                        }
                    })
                  })
            }
        }
    } catch (err) {
          console.log(err)
          res.status(500).json({ result: err, msg: "Error"});
    }
    }
}

const jiraController = new Jira();
module.exports = jiraController;
