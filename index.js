const { json } = require("express");
const express = require("express");
const cors = require("cors");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

const app = express();
app.use(formidable());
app.use(cors());

mongoose.connect(process.env.MANGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_API_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Import des routes
const userRoutes = require("./routes/user");
app.use(userRoutes);
const offerRoutes = require("./routes/offer");
app.use(offerRoutes);

app.all("*", (req, res) => {
  res.status(404).json({ message: error.message });
});

app.listen(process.env.PORT, () => {
  console.log("Server Started");
});
