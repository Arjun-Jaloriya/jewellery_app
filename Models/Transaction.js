const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const TransactionSchema = new mongoose.Schema(
  {
    date:{
        type:Date,
        required: true,
    },
    user:{
      type:mongoose.ObjectId,
      ref:"Vuser"
    },
    product_name: {
      type: String,
      required: true,
      trim: true,
    },
    description:{
      type: String,
    },
    weight:{
      type:Double,
      required: true,
    },
    total_amount:{
      type:Double,
      required: true,
    },
    advance:{
      type:Double,
      required: true,
    },


  
  },
  { timestamps: true }
);


const Vendor = mongoose.model("Vendor", VendorSchema);

module.exports = { Vendor };
