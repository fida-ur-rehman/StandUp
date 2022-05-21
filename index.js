//IMPORTS
const express = require('express');

const morgan = require("morgan")
const mongoose = require("mongoose");
const bodyParser = require("body-parser")
const cors = require("cors")
const bcrypt = require("bcrypt")
const crypto = require("crypto")
const Grid = require("gridfs-stream")
require("dotenv").config()

//CONSTANTS
const { socketConnection } = require('./socket');
const app = express()
const Server = require('http').Server(app);
socketConnection(Server);
const port = process.env.PORT || 3002

//MIDDLEWAREs
app.use(cors())
app.use(morgan("dev"))
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json())

//DATABSE CONNECTION
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true,
  })
  .then(() =>{console.log("Mongodb Database Connected Successfully")
})
  .catch((err) => {
    console.log(err)
    console.log("NOT CONNECTED TO DB")
  })

const conn = mongoose.connection

conn.on('error', console.error.bind(console, "Error connecting to db"));

let gfs;
// Grid Stream Intt
conn.once('open', async () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads")
  module.exports = gfs;
})

// Routes
app.use("/api/auth", require("./src/routes/auth"));
app.use("/api/user", require("./src/routes/user"));
app.use("/api/standup", require("./src/routes/standup"));
app.use("/api/task", require("./src/routes/task"));
app.use("/api/status", require("./src/routes/status"));
app.use("/api/comment", require("./src/routes/comment"));
app.use("/api/activity", require("./src/routes/activity"));

app.get('/home', (req, res) => {
  res.send('Hello World!')
})

//Socket Setup
// const io = require("socket.io")(Server, {
//   cors: { origin: "*" }
// })

// let onlineUsers = {}
// io.on("connection", (socket) => {
//   console.log("user Connected "+ socket.id)

//   socket.id = socket.handshake.query._id;
//   onlineUsers[socket.id] = socket;

//   socket.on('Activity', message => {
//     connectionMap[message.receiver_id].emit('Activity', message);
//   });

//   socket.on("disconnect", function () {
//     delete onlineUsers[client];
//     console.log("Disconnected")
//   });

// })


// const socketIoObject = io;
// module.exports.ioObject = socketIoObject;

//LISTEN
Server.listen(port, () => {
  console.log(`Running on port http://localhost:${port}`)
})
