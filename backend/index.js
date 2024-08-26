const express = require("express");
const { default: mongoose } = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require('dotenv').config();



//routes
// const authRoutes = require("./routes/auth");
const customerRoutes = require("./routes/customerRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.urlencoded({extended: false}));
app.use(bodyParser.json());

const PORT = 8000;

//connections
mongoose
  .connect("mongodb+srv://vijaysingh:Q7EYiv0fZ1ksby9H@cluster0.4uwrx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("MongoDB connected!"))
  .catch((e) => console.log("Error: ", e));

// app.use("/", authRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api', authRoutes); // login/logout

app.listen(PORT, () => console.log(`Server started on port: ${PORT}`));