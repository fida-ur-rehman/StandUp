const {planModel} = require("../models/plan");
const {activity} = require("../middleware/activity")
const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');


class Plan {
  async allPlan(req, res) {
    try {
      let _plan = await planModel
        .find({})
        .sort({ _id: -1 });
      if (_plan) {
        return res.status(200).json({ result: _plan, msg: "Success"});
      }
    } catch (err) {
        console.log(err)
        return res.status(500).json({ result: err, msg: "Error"});
    }
  }

  async getPlan(req, res) {
      try {
          let {planId} = req.body;
          if(!planId) {
            return res.status(201).json({ result: "Data Missing", msg: "Error"});
          } else {
            let _plan = await planModel.findOne({_id: planId})
            if (_plan) {
              return res.status(200).json({ result: _plan, msg: "Success"});
            } else {
              return res.status(201).json({ result: "Not Found", msg: "Error"});
            }
          }
      } catch (err) {
            console.log(err)
            res.status(500).json({ result: err, msg: "Error"});
      }
  }

  async createPlan(req, res) {
    try {
      let { name, forSpecific, organisation, standupCreators, standups, standupPerUser, taskPerStandup, userPerStandup, insight, jira, selfServer, exportImport, price, validityInDays} = req.body
      if(!name || !organisation || !standupCreators || !standups || !standupPerUser || !taskPerStandup || !userPerStandup || !price || !validityInDays ) {
        return res.status(201).json({ result: "Data Missing", msg: "Error"});
      } else {

        let singleDayPrice = Math.round(price/validityInDays)
          let _plan = new planModel({
            name,
            purchaseId: uuidv4(),
            forSpecific,
            organisation,
            standupCreators,
            standups,
            standupPerUser,
            taskPerStandup,
            userPerStandup,
            insight,
            jira,
            selfServer,
            exportImport,
            price,
            validityInDays,
            singleDayPrice
          });
          _plan
            .save()
            .then((created) => {
                return res.status(200).json({ result: created, msg: "Success"});
            })
      }
    } catch (err) {
      console.log(err)
      return res.status(500).json({ result: err, msg: "Error"});
    }
  }

  async editPlan(req, res) {
    try {
        let {planId} = req.body;
          if(!planId) {
            return res.status(201).json({ result: "Data Missing", msg: "Error"});
          } else {
            const updateOps = {};
            for(const ops of req.body.data){
                updateOps[ops.propName] = ops.value;
            }
            let _plan = await planModel.updateOne({_id: mongoose.Types.ObjectId(planId)}, {
                $set: updateOps
            });
            if(_plan.nModified === 1) {
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

    async deletePlan(req, res) {
        try {
            let {planId} = req.body;
            if(!planId) {
                return res.status(201).json({ result: "Data Missing", msg: "Error"});
            } else {
                let _plan = await planModel.remove({_id: planId})
                if(_plan.deletedCount === 1) {
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

    async setStatus(req, res) {
      try {
          let {planId, status} = req.body;
            if(!planId || !status) {
              return res.status(201).json({ result: "Data Missing", msg: "Error"});
            } else {
             
              let _plan = await planModel.updateOne({_id: mongoose.Types.ObjectId(planId)}, {
                  $set: {status}
              })
              if(_plan.nModified === 1) {
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

    async setVisibilty(req, res) {
      try {
          let {planId, visibility} = req.body;
            if(!planId) {
              return res.status(201).json({ result: "Data Missing", msg: "Error"});
            } else {
             
              let _plan = await planModel.updateOne({_id: mongoose.Types.ObjectId(planId)}, {
                  $set: {visibility}
              })
              if(_plan.nModified === 1) {
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

    async addOrganisation(req, res) {
      try {
          let {planId, ownerEmail} = req.body;
            if(!planId || !ownerEmail) {
              return res.status(201).json({ result: "Data Missing", msg: "Error"});
            } else {
              let _plan = await planModel.updateOne({_id: mongoose.Types.ObjectId(planId)}, {
                  $addToSet: {organisation: ownerEmail}
              });
              if(_plan.nModified === 1) {
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
}

const planController = new Plan();
module.exports = planController;
