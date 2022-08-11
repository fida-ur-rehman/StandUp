const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const collections = ['Task', 'User'];

// total Number of employees or member
// • total number of member allowed to create standup.
// • total standups
// • Number of standup per member
// • Number of tasks per standup.
// • Number of member per standup.
// • Insight allowed?
// •Jira integration allowed?
// • Self server integration allowed?
// • export/import allowed?

const planSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            require: true
        },
        purchaseId: {
            type: String,
            unique: true,
            require: true,
        },
        forSpecific: {
            type: Boolean,
            require: true
        },
        organisation: [{type: String}],
        standupCreators: {
            type: Number,
            require: true
        },
        standups: {
            type: Number,
            require: true
        },
        standupPerUser: {
            type: Number,
            require: true
        },
        taskPerStandup: {
            type: Number,
            require: true
        },
        usersPerStandup: {
            type: Number,
            require: true
        },
        insight: {
            type: Boolean,
            require: true
        },
        jira: {
            type: Boolean,
            require: true
        },
        selfServer: {
            type: Boolean,
            require: true
        },
        exportImport: {
            type: Boolean,
            require: true
        },
        visibility: {
            type: Boolean,
            require: true,
            default: false
        },
        price: {
            type: Number,
            require: true,
            default: 0,
            min:0
        },
        validityInDays: {
            type: Number,
            require: true,
            default: 0,
            min:0
        },
        singleDayPrice: {
            type: Number,
            require: true,
            default: 0,
            min:0
        },
        status: {
            type: String,
            enum: ["Active", "InActive"],
            require: true,
            default: "InActive"
        },
        startDate: {
            type: String,
            require: true,
            default: new Date()
        },
        endDate: {
            type: String,
            require: true,
            default: new Date()
        },
        createdBy: {
            type: ObjectId,
            ref: "User",
            require: true
        }
    },
     { timestamps: true }
);


const planModel = mongoose.model("Plan", planSchema);
module.exports = {planModel, planSchema};
