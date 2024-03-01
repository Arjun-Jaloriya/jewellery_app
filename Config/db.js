const mongoose = require("mongoose");
require("dotenv").config();

const uri = process.env.DEMO_MONGO_URI;
mongoose.set("strictQuery", false);
mongoose
  .connect(uri)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
   return console.error("Error connecting to MongoDB:", error);
  });
