const {teamModel} = require("../models/team");
const {activity} = require("../middleware/activity")
const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');


class Team {
  async allTeam(req, res) {
    try {
      let _team = await teamModel
        .find({})
        .sort({ _id: -1 });
      if (_team) {
        return res.status(200).json({ result: _team, msg: "Success"});
      }
    } catch (err) {
        console.log(err)
        return res.status(500).json({ result: err, msg: "Error"});
    }
  }

  async getTeam(req, res) {
      try {
          let {teamId} = req.body;
          if(!teamId) {
            return res.status(201).json({ result: "Data Missing", msg: "Error"});
          } else {
            let _team = await teamModel.findOne({_id: teamId})
            console.log(_team)
            if (_team) {
                console.log(_team)
            return res.status(200).json({ result: _team, msg: "Success"});
            }
          }
      } catch (err) {
            console.log(err)
            res.status(500).json({ result: err, msg: "Error"});
      }
  }

  async orgTeams(req, res) {
    try {
        let {orgId} = req.body;
        if(!orgId) {
          return res.status(201).json({ result: "Data Missing", msg: "Error"});
        } else {
          let _team = await teamModel.find({organisation: mongoose.Types.ObjectId(orgId)})
          if (_team) {
            return res.status(200).json({ result: _team, msg: "Success"});
          } else {
            return res.status(201).json({ result: "Not Found" , msg: "Success"});
          }
        }
    } catch (err) {
          console.log(err)
          res.status(500).json({ result: err, msg: "Error"});
    }
}

  async createTeam(req, res) {
    try {
      let { name, organisation, members} = req.body
      if(!name || !organisation || !members) {
        return res.status(201).json({ result: "Data Missing", msg: "Error"});
      } else {

//         let _members = []
//         members.forEach(element => {
          
//         });
//         ///


//         /// Member Setup
//         //name and Id


//         ////
// // ..

          let _team = new teamModel({
            name,
            organisation,
            members,
          });
          _team
            .save()
            .then((created) => {
                return res.status(200).json({ result: _team, msg: "Success"});
            })
      }
    } catch (err) {
      console.log(err)
      return res.status(500).json({ result: err, msg: "Error"});
    }
  }

  async editName(req, res) {
    try {
        let {teamId, name} = req.body;
          if(!teamId || !name) {
            return res.status(201).json({ result: "Data Missing", msg: "Error"});
          } else {
            let _team = await teamModel.updateOne({_id: mongoose.Types.ObjectId(teamId)}, {
                $set: {name}
            });
            if(_team.nModified === 1) {
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
        let {teamId, members} = req.body;
          if(!teamId || !members) {
            return res.status(201).json({ result: "Data Missing", msg: "Error"});
          } else {
            members.forEach(async (mem, index) => {

              let _team = await teamModel.updateOne({_id: teamId, "members": {"$not": {"$elemMatch": {"userId": mem.userId}}}}, {
                $addToSet: {members: mem}
            });
            if (index === members.length -1) {
 
                return res.status(200).json({ result: "Updated", msg: "Success" });
                // resolve()

            };
            });
          }
    } catch (err) {
      console.log(err)
      return res.status(500).json({ result: err, msg: "Error"});
    }
  }

  async removeMembers(req, res) {
    try {
        let {teamId, members} = req.body;
          if(!teamId || !members) {
            return res.status(201).json({ result: "Data Missing", msg: "Error"});
          } else {
            members.forEach(async (mem, index) => {

              let _team = await teamModel.updateOne({_id: teamId}, {
                $pull: {members: mem}
            });
            if (index === members.length -1) {
                return res.status(200).json({ result: "Updated", msg: "Success" });
                // resolve()
          }
        });
        }
    } catch (err) {
      console.log(err)
      return res.status(500).json({ result: err, msg: "Error"});
    }
  }

    async deleteTeam(req, res) {
        try {
            let {teamId} = req.body;
            if(!teamId) {
                return res.status(201).json({ result: "Data Missing", msg: "Error"});
            } else {
                let _team = await teamModel.remove({_id: teamId})
                if(_team.deletedCount === 1) {
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

const teamController = new Team();
module.exports = teamController;
