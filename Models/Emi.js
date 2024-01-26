const mongoose = require("mongoose");

const EmiSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
    },
    customerMobile: {
      type: String,
    },
    address: {
      type: String,
    },
    fixed_Emi: { type: Number, required: true },
    transactions: [
      {
        amount: { type: Number, default: 0 },
        paymentType: {
          type: String,
          required: true,
          default: "cash",
          enum: ["cash", "card", "upi"],
        },
        date: { type: Date, default: new Date() },
      },
    ],
    total_creditamount: {
      type: Number,
      default: 0,
    },
    completation_date: { type: Date,},
    status: { type: String },
  },
  { timestamps: true }
);

const Emi = mongoose.model("Emi", EmiSchema);
module.exports = { Emi };
