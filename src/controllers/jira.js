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
const { organisationModel } = require("../models/organisation");

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
        let {email, baseUrl, accessToken, orgId} = req.body;
        if(!email || !baseUrl || !accessToken || !orgId) {
          return res.status(201).json({ result: "Data Missing", msg: "Error"});
        } else {
            const usernamePasswordBuffer = Buffer.from(email + ':' + accessToken);
            const base64data = usernamePasswordBuffer.toString('base64');
            let accessTokenE = encrypt(accessToken, process.env.SECRET)

            let _org = await organisationModel.updateOne({_id: mongoose.Types.ObjectId(orgId)}, {$set: {jira: {email, baseUrl, accessToken: accessTokenE}}})
            let checkData = axios.get(`http://${baseUrl}.atlassian.net/rest/api/2/issue/createmeta`, {headers: { 
            'Authorization': `Basic ${base64data}`
          }})
          checkData.then((response) => {
            if (_org && response.status === 200) {
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
          let {issueId, orgId} = req.body;
          // let {jira} = req.user
        //   console.log(jira)
          if(!issueId || !orgId) {
            return res.status(201).json({ result: "Data Missing", msg: "Error"});
          } else {
            let _org = await organisationModel.findOne({_id: mongoose.Types.ObjectI(orgId)})
            if(!_org) {
              return res.status(201).json({ result: "Data Missing", msg: "Error"});
            } else {
              let {jira} = _org
              if(!jira.baseUrl || !jira.email || !jira.accessToken) {
                return res.status(201).json({ result: "Please Sign in with Jira", msg: "Error"});
            } else {
                let accessTokenD = decrypt(jira.accessToken, process.env.SECRET)
                const usernamePasswordBuffer = Buffer.from(jira.email + ':' + accessTokenD);
                const base64data = usernamePasswordBuffer.toString('base64');
                console.log("inside jira route --------------------------")
                let _issue = axios.get(`http://${jira.baseUrl}.atlassian.net/rest/api/2/issue/${issueId}`, {headers: { 
                    'Authorization': `Basic ${base64data}`
                }})

                _issue.then((response) => {
                    console.log(response.status)
                    if(response.status === 200) {
                        let newIssue = {
                            title: response.data.fields.summary,
                            desc: response.data.fields.description,
                            taskId: response.data.key,
                            userName: response.data.fields.creator.displayName,
                            taskType: response.data.fields.labels[0]
                        }
                        return res.status(200).json({ result: newIssue, msg: "Success"});
                    } else {
                        return res.status(201).json({ result: response.errorMessages[0], msg: "Error"});
                    }
                })
            }
            }
          }
      } catch (err) {
            console.log(err)
            res.status(500).json({ result: err, msg: "Error"});
      }
  }

  async importIssue(req, res) {
    try {
        let {issueId, standupId, orgId} = req.body;
        // let {jira} = req.user
        if(!issueId || !standupId || !orgId) {
          return res.status(201).json({ result: "Data Missing", msg: "Error"});
        } else {
          let _org = await organisationModel.findOne({_id: mongoose.Types.ObjectI(orgId)})
            if(!_org) {
              return res.status(201).json({ result: "Data Missing", msg: "Error"});
            } else {
              let {jira} = _org
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
                        let _task = new taskModel({
                            title: response.data.fields.summary,
                            desc: response.data.fields.description,
                            taskId: shortid.generate(), //calculate unique
                            userId: req.user._id,
                            userName: req.user.name,
                            standupId,
                            taskType: response.data.fields.labels[0]
                          });
                          _task
                            .save()
                            .then((created) => {
                                // activity(created._id, "New Task", "Task", null, standupId, null, null, req.user.name)
                                return res.status(200).json({ result: _task, msg: "Success"});
                            })
                    } else {
                        return res.status(201).json({ result: response.errorMessages[0], msg: "Error"});
                    }
                })
            }
            }
        }
    } catch (err) {
          console.log(err)
          res.status(500).json({ result: err, msg: "Error"});
    }
    }

    async Update(req, res) {
      try {
          let {issueId, standupId, orgId} = req.body;
          // let {jira} = req.user
          if(!issueId || !standupId || !orgId) {
            return res.status(201).json({ result: "Data Missing", msg: "Error"});
          } else {
            let _org = await organisationModel.findOne({_id: mongoose.Types.ObjectI(orgId)})
              if(!_org) {
                return res.status(201).json({ result: "Data Missing", msg: "Error"});
              } else {
                let {jira} = _org
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
                          let _task = new taskModel({
                              title: response.data.fields.summary,
                              desc: response.data.fields.description,
                              taskId: shortid.generate(), //calculate unique
                              userId: req.user._id,
                              userName: req.user.name,
                              standupId,
                              taskType: response.data.fields.labels[0]
                            });
                            _task
                              .save()
                              .then((created) => {
                                  // activity(created._id, "New Task", "Task", null, standupId, null, null, req.user.name)
                                  return res.status(200).json({ result: _task, msg: "Success"});
                              })
                      } else {
                          return res.status(201).json({ result: response.errorMessages[0], msg: "Error"});
                      }
                  })
              }
              }
          }
      } catch (err) {
            console.log(err)
            res.status(500).json({ result: err, msg: "Error"});
      }
      }

      async delete(req, res) {
        try {
            let {issueId, standupId, orgId} = req.body;
            // let {jira} = req.user
            if(!issueId || !standupId || !orgId) {
              return res.status(201).json({ result: "Data Missing", msg: "Error"});
            } else {
              let _org = await organisationModel.findOne({_id: mongoose.Types.ObjectI(orgId)})
                if(!_org) {
                  return res.status(201).json({ result: "Data Missing", msg: "Error"});
                } else {
                  let {jira} = _org
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
                            let _task = new taskModel({
                                title: response.data.fields.summary,
                                desc: response.data.fields.description,
                                taskId: shortid.generate(), //calculate unique
                                userId: req.user._id,
                                userName: req.user.name,
                                standupId,
                                taskType: response.data.fields.labels[0]
                              });
                              _task
                                .save()
                                .then((created) => {
                                    // activity(created._id, "New Task", "Task", null, standupId, null, null, req.user.name)
                                    return res.status(200).json({ result: _task, msg: "Success"});
                                })
                        } else {
                            return res.status(201).json({ result: response.errorMessages[0], msg: "Error"});
                        }
                    })
                }
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
