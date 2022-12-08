
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const {userSchema} = require("../models/user")

const clientOption = {
  socketTimeoutMS: 30000,
  keepAlive: true,
  poolSize: 5,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
};

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on("connected", () => {
  console.log("Mongoose default connection open");
});

// If the connection throws an error
mongoose.connection.on("error", err => {
  console.log("Mongoose default connection error: " + err);
});

// When the connection is disconnected
mongoose.connection.on("disconnected", () => {
  console.log("Mongoose default connection disconnected");
});

// If the Node process ends, close the Mongoose connection
process.on("SIGINT", () => {
  mongoose.connection.close(() => {
    console.log(
      "Mongoose default connection disconnected through app termination"
    );
    process.exit(0);
  });
});

const initAdminDbConnection = () => {
  try {
    const db = mongoose.createConnection(process.env.DATABASE1, clientOption);

    db.on(
      "error",
      console.error.bind(
        console,
        "initAdminDbConnection MongoDB Connection Error>> : "
      )
    );
    db.once("open", () => {
      console.log("initAdminDbConnection client MongoDB Connection ok!");
    });

    // require all schemas !?
    // require("../dbModel/tenant/schema");
    // db.model("User", userSchema)
    return db;
  } catch (error) {
    console.log("initAdminDbConnection error", error);
  }
};

module.exports = {
  initAdminDbConnection
};