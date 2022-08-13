const {organisationModel} = require("../models/organisation");
const {activity} = require("../middleware/activity")
const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');
const { request } = require("express");
const { planModel } = require("../models/plan");


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
              creation: "Admin"
            });
            _organisation
              .save()
              .then((created) => {
                  return res.status(200).json({ result: created, msg: "Success"});
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
              createdBy: req.user._id
            });
            _organisation
              .save()
              .then((created) => {
                  return res.status(200).json({ result: created, msg: "Success"});
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
