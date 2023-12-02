const mongoose = require("mongoose");
require("dotenv").config();

const uri = process.env.MONGO_URI;
mongoose.set("strictQuery", false);
mongoose
  .connect(uri)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
   return console.error("Error connecting to MongoDB:", error);
  });
