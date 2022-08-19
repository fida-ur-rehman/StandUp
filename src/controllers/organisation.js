const {organisationModel} = require("../models/organisation");
const {activity} = require("../middleware/activity")
const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');
const { request } = require("express");
const { planModel } = require("../models/plan");
const { userModel } = require("../models/user");
const { convertDays } = require("../middleware/convertDays");


class Organisation {
  async allOrganisation(req, res) {
    try {
      
      let _organisation = await organisationModel
        .find({})
        .sort({ _id: -1 });
      if (_organisation) {
        return res.status(200).json({ result: _organisation, msg: "Success"});
      }
    } catch (err) {
        console.log(err)
        return res.status(500).json({ result: err, msg: "Error"});
    }
  }

  async getOrganisation(req, res) {
      try {
          let {organisationId} = req.body;
          if(!organisationId) {
            return res.status(201).json({ result: "Data Missing", msg: "Error"});
          } else {
            let _organisation = await organisationModel.findOne({_id: mongoose.Types.ObjectId(organisationId)})
            if (_organisation) {
            return res.status(200).json({ result: _organisation, msg: "Success"});
            } else {
              return res.status(201).json({ result: "Not Found", msg: "Error"});
            }
          }
      } catch (err) {
            console.log(err)
            res.status(500).json({ result: err, msg: "Error"});
      }
  }

  async getAllMembers(req, res) {
    try {
        let {organisationId} = req.body;
        if(!organisationId) {
          return res.status(201).json({ result: "Data Missing", msg: "Error"});
        } else {
          let _users = await userModel.aggregate([
            {$match: {"organisations.organisationId": mongoose.Types.ObjectId(organisationId)}}
          ])
          if (_users) {
          return res.status(200).json({ result: _users, msg: "Success"});
          } else {
            return res.status(201).json({ result: "Not Found", msg: "Error"});
          }
        }
    } catch (err) {
          console.log(err)
          res.status(500).json({ result: err, msg: "Error"});
    }
}

  async createOrganisation(req, res) {
    try {
      if(req.user.role === "Admin") {
        let { name, planId, owner} = req.body
        if(!name || !planId || !owner) {
          return res.status(201).json({ result: "Data Missing", msg: "Error"});
        } else {
          let plan = await planModel.findOne({_id: mongoose.Types.ObjectId(planId)})
          if(plan) {
            let _organisation = new organisationModel({
              name,
              owner,
              plan,
              createdBy: req.user._id,
              creation: "Admin",
              joiningId: uuidv4()
            });
            _organisation
              .save()
              .then( async (created) => {
                    return res.status(200).json({ result: created, msg: "Success"})
              })
          } else {
            return res.status(201).json({ result: "Invalid Plan Selected", msg: "Error"});
          }
        }
      } else {
        let { name, planId} = req.body
        if(!name || !planId) {
          return res.status(201).json({ result: "Data Missing", msg: "Error"});
        } else {
          let plan = await planModel.findOne({_id: mongoose.Types.ObjectId(planId)})
          if(plan) {
            let _organisation = new organisationModel({
              name,
              owner: req.user.email,
              plan,
              createdBy: req.user._id,
              joiningId: uuidv4()
            });
            _organisation
              .save()
              .then( async (created) => {
                let addOrgToUser = await userModel.updateOne({email: req.user.email}, {$addToSet: {"organisations": {"organisationId": created._id, "role": "ADMIN"}}})
                if(addOrgToUser.nModified === 1) {
                  return res.status(200).json({ result: created, msg: "Success"});
                } else {
                  return res.status(200).json({ result: "Not Found User", msg: "Success"});
                }
              })
          } else {
            return res.status(201).json({ result: "Invalid Plan Selected", msg: "Error"});
          }
        }
      }
    } catch (err) {
      console.log(err)
      return res.status(500).json({ result: err, msg: "Error"});
    }
  }

  async editOrganisation(req, res) {
    try {
        let {organisationId} = req.body;
          if(!organisationId) {
            return res.status(201).json({ result: "Data Missing", msg: "Error"});
          } else {
            const updateOps = {};
            for(const ops of req.body.data){
                updateOps[ops.propName] = ops.value;
            }
            let _organisation = await organisationModel.updateOne({_id: mongoose.Types.ObjectId(organisationId)}, {
                $set: updateOps
            });
            // console.log(updateOps)
            if(_organisation.nModified === 1) {
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

    async setActive(req, res) {
        try {
            let {organisationId, status} = req.body;
            if(!organisationId || !status) {
                return res.status(201).json({ result: "Data Missing", msg: "Error"});
            } else {
                let _organisation = await organisationModel.updateOne({_id: mongoose.Types.ObjectId(organisationId)}, {$set: {status}})
                if(_organisation.nModified === 1) {
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

    async changeRole(req, res) {
      try {
          let {organisationId, userId, role} = req.body;
          if(!organisationId || !userId) {
              return res.status(201).json({ result: "Data Missing", msg: "Error"});
          } else {
            let _role = ["MEMBER", "ADMIN"]
              let _organisation = await userModel.updateOne({_id: mongoose.Types.ObjectId(userId), "organisations.organisationId": organisationId}, {$set: {"organisations.$.role": _role[role]}})
              if(_organisation.nModified === 1) {
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

  async addPermission(req, res) {
    try {
        let {organisationId, userId, permission} = req.body;
        if(!organisationId || !userId) {
            return res.status(201).json({ result: "Data Missing", msg: "Error"});
        } else {
          let _permissions = ["STANDUP-CREATOR"]
            let _organisation = await userModel.updateOne({_id: mongoose.Types.ObjectId(userId), "organisations.organisationId": organisationId}, {$addToSet: {"organisations.$.permissions": _permissions[permission]}})
            if(_organisation.nModified === 1) {
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
async removePermission(req, res) {
  try {
      let {organisationId, userId, permission} = req.body;
      if(!organisationId || !userId) {
          return res.status(201).json({ result: "Data Missing", msg: "Error"});
      } else {
        let _permissions = ["STANDUP-CREATOR"]
          let _organisation = await userModel.updateOne({_id: mongoose.Types.ObjectId(userId), "organisations.organisationId": organisationId}, {$pull: {"organisations.$.permissions": _permissions[permission]}})
          if(_organisation.nModified === 1) {
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

  async removeMember(req, res) {
    try {
        let {organisationId, userId} = req.body;
        if(!organisationId || !userId) {
            return res.status(201).json({ result: "Data Missing", msg: "Error"});
        } else {
            let _user = await userModel.updateOne({_id: mongoose.Types.ObjectId(userId)}, {$pull: {"organisations": {organisationId}}})
            if(_user.nModified === 1) {
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

async addMembers(req, res) {
  try {
      let {organisationId, users} = req.body;
      if(!organisationId || !users) {
          return res.status(201).json({ result: "Data Missing", msg: "Error"});
      } else {
        let _members = [] 
        let _notMember = [] //invite
        let _org = await organisationModel.findOne({_id: mongoose.Types.ObjectId(organisationId)})
        let memberSetup = new Promise((resolve, reject) => {

          users.forEach(async (member, index) => {
              let user = await userModel.findOne({email: member})
                if(!user || user === null){
                    _notMember.push(member)
                } else {
                    _members.push(member)
                }
                if (index === users.length -1) resolve();
          })
        })

        memberSetup.then(() => {
          _members.forEach(async (member, index) => {
            await userModel.updateOne({email: member, "organisations": {$not: {$elemMatch: {"organisationId": organisationId}}}}, {$addToSet: {"organisations": {"organisationId": organisationId}}})
          })

          _notMember.forEach( async () => {
            //Send Email
          })

          return res.status(200).json({ result: "Updated", msg: "Success" })
        })
      }
  } catch (err) {
  console.log(err)
  return res.status(500).json({ result: err, msg: "Error"});
  }
}

    async orgPlan(req, res) {
      try {
          let {organisationId} = req.body;
          if(!organisationId) {
              return res.status(201).json({ result: "Data Missing", msg: "Error"});
          } else {
              let _organisation = await organisationModel.findOne({_id: mongoose.Types.ObjectId(organisationId)})
              if(_organisation) {
                  return res.status(200).json({ result: _organisation.plan, msg: "Success" });
              } else {
                  return res.status(201).json({ result: "Not Found", msg: "Error"});
              }
          }
      } catch (err) {
      console.log(err)
      return res.status(500).json({ result: err, msg: "Error"});
      }
  }

  async verify(req, res) {
    try {
        let {organisationId, verified} = req.body;
        if(!organisationId) {
            return res.status(201).json({ result: "Data Missing", msg: "Error"});
        } else {
            let _organisation = await organisationModel.updateOne({_id: mongoose.Types.ObjectId(organisationId)}, {$set: {verified}})
            if(_organisation) {
                return res.status(200).json({ result: _organisation.plan, msg: "Success" });
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

const organisationController = new Organisation();
module.exports = organisationController;
