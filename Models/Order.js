const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
    },
    customerMobile: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    items: [
      {
        name: { type: String, required: true },
        weight: { type: Number, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        type: { type: String, required: true, default: "gold" },
      },
    ],
    isFullPayment: {
      type: Boolean,
      default: true,
    },
    total_amount: {
      type: Number,
      required: true,
    },
    advance_payment:{
      type:Number,
      required:true,
    },
    remainingAmount: {
      type: Number,
  
    },
    dueDate: {
      type: Date,
    },
    paymentType: {
      type: String,
      required: true,
      default:"cash",
      enum:["cash","card","upi"],
      required:true,
    },
    transactions: [
      {
        amount: {type:Number,default:0},
        date: {type:Date,default:new Date()},
      },
    ],
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", OrderSchema);
module.exports = {Order};
