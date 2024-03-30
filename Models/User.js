const mongoose = require("mongoose");

const Userschema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true,lowercase: true },
    password: { type: String, required: true },
    phone: { type: Number, required: true, unique: true },
    address: { type: String, required: true },
    shopName:{type:String,required:true},
    role: { type: Number, default: 0 },
    token: {
      type: String,
    },
    status: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", Userschema);
module.exports = { User };
