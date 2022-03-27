// const mongoose = require("mongoose");
// const { ObjectId } = mongoose.Schema.Types;

// const taskType = ['Epic', 'Bug', 'Blocker'];

// const statusSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       require: true
//     },
//     desc: {
//         type: String,
//         require: true
//     },
//     taskId: {type: String, unique:true, require: true},
//     userId: {type: ObjectId, ref: "User", require: true},
//     type: {
//         type: String,
//         enum: taskType,
//         require: true
//     },
//   },
//   { timestamps: true }
// );


// const status = mongoose.model("status", statusSchema);
// module.exports = status;
