const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
    },
    customerMobile: {
      type: String,
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
      default:0
    },
    remainingAmount: {
      type: Number,
      default:0
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
    status:{
      type:String,
      // enum:["Payment_Completed","Payment_Pending"],
      // default:"Payment_Completed"
    }
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", OrderSchema);
module.exports = {Order};
