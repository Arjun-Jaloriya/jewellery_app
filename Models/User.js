const mongoose = require("mongoose");

const Userschema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String ,unique:true},
  password:{type:String,required:true},
  phone: { type: Number, required: true,unique:true },
  address: { type: String, required: true },
  role: { type: Number, default: 0 },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  status: {
    type: Number,
    default: 1,
  },
  vendor_id:{
    type: mongoose.ObjectId,
    ref: "Vendor",
  },
  vuser_id:{
    type: mongoose.ObjectId,
    ref: "Vuser",
  }
},
{ timestamps: true });

const User = mongoose.model("User",Userschema);
module.exports = {User};