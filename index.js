//IMPORTS
const express = require('express');
const morgan = require("morgan")
const mongoose = require("mongoose");
const bodyParser = require("body-parser")
const bcrypt = require("bcrypt")
const crypto = require("crypto")
require("dotenv").config()

//CONSTANTS
const app = express()
const port = process.env.PORT || 3004

//MIDDLEWAREs
app.use(morgan("dev"))
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json())


//DATABSE CONNECTION
mongoose
  .connect('mongodb://localhost:27017/standup', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true,
  })
  .then(() =>console.log("Mongodb Database Connected Successfully"))
  .catch((err) => {
    console.log(err)
    console.log("NOT CONNECTED TO DB")
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

//LISTEN
app.listen(port, () => {
  console.log(`Running on port http://localhost:${port}`)
})