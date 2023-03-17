const http = require('http')
const express = require("express");
const router = require('express').Router()
const cors = require("cors");
const mongoose = require("mongoose");
const logger = require("morgan")
const userRoutes = require('./routes/user')
const employeeRoutes = require('./routes/employee')
mongoose.set('strictQuery', true)
require("dotenv").config();

const port = process.env.PORT;
const app = express();
const server = http.createServer(app)
const {Server} = require("socket.io")
const io = new Server(server)

process.env.NODE_ENV === "development"
  ? mongoose
      .connect(process.env.MONGO_DB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => console.log("Local DB connected!"))
      .catch((err) => {
        console.log(err);
      })
  : mongoose
      .connect(process.env.MONGO_DB_URI_CLOUD)
      .then(() => console.log("Cloud DB connected successfully!"))
      .catch((err) => console.log(err));

app.use(cors());
app.use(logger('dev'))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (request, response) => {
    response.send("Welcome to CEMS");
});

app.use("/user", userRoutes)
app.use('/employee', employeeRoutes)

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
