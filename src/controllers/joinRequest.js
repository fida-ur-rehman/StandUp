const {joinRequestModel} = require("../models/joinRequest");
const {activity} = require("../middleware/activity")
const mongoose = require("mongoose");
const shortid = require("shortid");
const { userModel } = require("../models/user");

class JoinRequest {
  async allJoinRequest(req, res) {
    try {
      let _joinRequest = await joinRequestModel
        .find({})
        .sort({ _id: -1 });
      if (_joinRequest) {
        return res.status(200).json({ result: _joinRequest, msg: "Success"});
      }
    } catch (err) {
        console.log(err)
        return res.status(500).json({ result: err, msg: "Error"});
    }
  }

  async getJoinRequest(req, res) {
      try {
          let {joinRequestId} = req.body;
          if(!joinRequestId) {
            return res.status(201).json({ result: "Data Missing", msg: "Error"});
          } else {
            let _joinRequest = await joinRequestModel.findOne({_id: joinRequestId})
            if (_joinRequest) {
            return res.status(200).json({ result: _joinRequest, msg: "Success"});
            }
          }
      } catch (err) {
            console.log(err)
            res.status(500).json({ result: err, msg: "Error"});
      }
  }

  async organisationsJoinRequest(req, res) {
    try {
        let {organisationId} = req.body;
        if(!organisationId) {
          return res.status(201).json({ result: "Data Missing", msg: "Error"});
        } else {
          let _joinRequest = await joinRequestModel.find({organisationId: new mongoose.Types.ObjectId(organisationId)})
          if (_joinRequest) {
          return res.status(200).json({ result: _joinRequest, msg: "Success"});
          } else {
            return res.status(201).json({ result: "Not Found", msg: "Error"});

          }
        }
    } catch (err) {
          console.log(err)
          res.status(500).json({ result: err, msg: "Error"});
    }
}


async usersJoinRequest(req, res) {
    try {
          let _joinRequest = await joinRequestModel.find({userId: req.user._id})
          if (_joinRequest) {
            return res.status(200).json({ result: _joinRequest, msg: "Success"});
          } else {
            return res.status(201).json({ result: "Not Found", msg: "Error"});
          }
    } catch (err) {
          console.log(err)
          res.status(500).json({ result: err, msg: "Error"});
    }
}

  

  async createJoinRequest(req, res) {
    try {
      let { organisationId } = req.body
      if(!organisationId) {
        return res.status(201).json({ result: "Data Missing", msg: "Error"});
      } else {
        let getJr = await joinRequestModel.findOne({organisationId, userId: req.user._id}) 
        if(getJr) {
            return res.status(200).json({ result: "Already Exist", msg: "Success"});
        } else {
            let _joinRequest = new joinRequestModel({
                organisationId,
                userId: req.user._id,
                userName: req.user.name
          });
          _joinRequest
            .save()
            .then((created) => {
                return res.status(200).json({ result: "Created", msg: "Success"});
            })
        }   
      }
    } catch (err) {
      console.log(err)
      return res.status(500).json({ result: err, msg: "Error"});
    }
  }

  async changeStatus(req, res) {
    try {
        let {joinRequest, status} = req.body;
          if(!joinRequest || !status) {
            return res.status(201).json({ result: "Data Missing", msg: "Error"});
          } else {
            if(status === "ACCEPTED"){
                let _user = await userModel.updateOne({_id: new mongoose.Types.ObjectId(joinRequest.userId), "organisations": {$not: {$elemMatch: {"organisationId": joinRequest.organisationId}}}}, {$addToSet: {"organisations": {"organisationId": joinRequest.organisationId}}})
                if(_user.nModified === 1) {
                    let _joinRequest = await joinRequestModel.updateOne({_id: joinRequest._id}, {$set: {status: "ACCEPTED"}})
                    if(_joinRequest.nModified === 1) {
                        return res.status(200).json({ result: "Accepted", msg: "Success" });
                    } else if(_joinRequest.nModified === 0) {
                        return res.status(200).json({ result: "Already Joined", msg: "Success" });
                    }
                } else {
                    return res.status(201).json({ result: "Not Found", msg: "Error" });
                }
            } else if (status === "REJECTED") {
                let _joinRequest = await joinRequestModel.updateOne({_id: joinRequest._id}, {$set: {status: "REJECTED"}})
                    if(_joinRequest.nModified === 1) {
                        return res.status(200).json({ result: "Rejected", msg: "Success" });
                    } else {
                        return res.status(201).json({ result: "Not Found", msg: "Error" });
                    }
            }
            if(_joinRequest.modifiedCount === 1) {
                return res.status(200).json({ result: "Updated", msg: "Success" });
            } else {
                return res.status(201).json({ result: "Not Found", msg: "Error"});
            }
          }
    } catch (err) {
      console.log(err)
      return res.status(500).json({ result: err, msg: "Error"});
    }
  }

    async deletedJoinRequest(req, res) {
        try {
            let {joinRequestId} = req.body;
            if(!joinRequestId) {
                return res.status(201).json({ result: "Data Missing", msg: "Error"});
            } else {
                let _joinRequest = await joinRequestModel.remove({_id: joinRequestId})
                if(_joinRequest.deletedCount === 1) {
                    return res.status(200).json({ result: "Deleted", msg: "Success" });
                } else {
                    return res.status(201).json({ result: "Not Found", msg: "Error"});
                }
            }
        } catch (err) {
        console.log(err)
        return res.status(500).json({ result: err, msg: "Error"});
        }
    }
}

const joinRequestController = new JoinRequest();
module.exports = joinRequestController;
