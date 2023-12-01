const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const TransactionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
      unique: true,
    },
    address: {
      type: {},
      required: true,
    },
    aadharno:{
        type:Number,
        required:true,
        unique: true,
    },
    accountno:{
        type:Number,
        required:true,
        unique: true,
    },
    role: {
      type: Number,
      default: 1,
      required: true,
    },
    pan:{
      type:String,
      required: true,
      unique: true,

    },
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
    ifsc:{
      type:String,
      required:true
    },
    startdate:{
        type:String,
        required: true,
    },
    enddate:{
        type:String,
        required: true,
    }
  },
  { timestamps: true }
);

// //password hash
// VendorSchema.pre("save", async function (next) {
//   if (this.isModified("password")) {
//     this.password = await bcrypt.hash(this.password, 10);
//   }
//   next();
// });

const Vendor = mongoose.model("Vendor", VendorSchema);

module.exports = { Vendor };
