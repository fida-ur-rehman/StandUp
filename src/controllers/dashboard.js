const {userModel} = require("../models/user");
const {organisationModel} = require("../models/organisation");
const {planModel} = require("../models/plan");
const {activity} = require("../middleware/activity")
const mongoose = require("mongoose");
const shortid = require("shortid")

class Dashboard {
    async dashboardData(req, res) {
        try {
          let orders = {};
          let newDate = new Date()

          let currentDate = new Date(Date.UTC(newDate.getUTCFullYear(), newDate.getUTCMonth(), newDate.getUTCDate()))
          let sixMonthOldDate = new Date(Date.UTC(newDate.getUTCFullYear(), newDate.getUTCMonth()-6, newDate.getUTCDate()))
            //   await userModel.aggregate([
            //         {$match: {"role": {$exists: true, $ne: "admin"}}},
            //         {$group: {
            //           "_id": {
            //             "role" : "$role"
            //           }, 
            //           "count": {"$sum": 1}
            //         }}
            //   ]).then( async (total) => {
            //         users = total
                    let sixMonthOldDate1 = new Date(Date.UTC(newDate.getUTCFullYear(), newDate.getUTCMonth()-6, newDate.getUTCDate()))
                    let lastMonthDate = new Date(Date.UTC(newDate.getUTCFullYear(), newDate.getUTCMonth()-1, newDate.getUTCDate()))
                    let currentDate2 = new Date(Date.UTC(newDate.getUTCFullYear(), newDate.getUTCMonth(), newDate.getUTCDate()))
                    let isoCurrentDate = new Date(currentDate2).toISOString()
                    let users = await userModel.aggregate([
                        { $facet: {
                            "totalUsers": [
                                { "$match": {
                                    "role": { "$ne": "Admin" }
                                }
                            },
                              {$group: {
                                "_id": null,
                                "count": {"$sum": 1}
                              }}
                              
                            ], 
                            "userJoinedPerDay": [
                                { "$match": {
                                   $and: [
                                    {"createdAt": { "$gte": lastMonthDate }},
                                    // {"role": { "$ne": "Admin" }}
                                   ]
                                }
                            },
                                {$group: {
                                    "_id": {
                                        "year": { "$year": "$createdAt" },
                                        "month": { "$month": "$createdAt" },
                                        "day": { "$dayOfMonth": "$createdAt" },
                                      },
                                      "count": { "$sum": 1 },
                                }},
                                {$sort: {"_id": 1}}
                              ], 
                      }}
                  ])
                  let organisation = await organisationModel.aggregate([
                    { $facet: {
                        "totalOrganisation": [
                          {$group: {
                            "_id": null,
                            "count": {"$sum": 1}
                          }}
                        ], 
                        "ActivePlan": [
                            // {$match: {"plan.endDate": {$lte: currentDate}}},
                            {$group: {
                              "_id": null,
                              "count": {"$sum": 1}
                            }}
                          ], 
                          "organisationPerDay": [
                            { "$match": {
                               $and: [
                                {"createdAt": { "$gte": lastMonthDate}},
                                // {"role": { "$ne": "Admin" }}
                               ]
                            }
                        },
                            {$group: {
                                "_id": {
                                    "year": { "$year": "$createdAt" },
                                    "month": { "$month": "$createdAt" },
                                    "day": { "$dayOfMonth": "$createdAt" },
                                  },
                                  "count": { "$sum": 1 },
                            }},
                            {$sort: {"_id": 1}}
                          ]
                  }}
              ])
              let plan = await planModel.aggregate([
                { $facet: {
                    "totalPlan": [
                      {$group: {
                        "_id": null,
                        "count": {"$sum": 1}
                      }}
                    ], 
              }}
          ])

          if(users && organisation && plan) {
            return res.status(200).json({ result: {users, organisation, plan}, msg: "Success"});          }

        } catch (err) {
              console.log(err)
              return res.status(500).json({ result: err, msg: "Error"});
      }
}
}

const dashboardController = new Dashboard();
module.exports = dashboardController;
