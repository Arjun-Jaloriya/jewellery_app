const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
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
    remark:{type:String},
    items: [
      {
        name: { type: String, required: true },
        weight: { type: Number, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        type: { type: String, required: true, default: "gold" },
        item_no: { type: String, required: true },
        labour: { type: Number, required: true },
      },
    ],
    replacement: [
      {
        name: { type: String },
        description: { type: String },
        weight: { type: Number },
        quantity: { type: Number },
        total_Price: { type: Number },
        type: { type: String, default: "gold" },
      },
    ],
    isFullPayment: {
      type: Boolean,
      default: true,
    },
    taxRate: { type: Number },
    subTotal: { type: Number },
    taxAmount: { type: Number },
    discount_amount: { type: Number,default:0 },
    total_amount: {
      type: Number,
      required: true,
    },
    advance_payment: {
      type: Number,
      default: 0,
    },
    remainingAmount: {
      type: Number,
      default: 0,
    },

    transactions: [
      {
        amount: { type: Number, default: 0 },
        date: { type: Date, default: new Date() },
        paymentType: {
          type: String,
          default: "cash",
          enum: ["cash", "card", "upi"],
        },
        remark:{type:String}
      },
    ],
    paymentType: {
      type: String,
      enum: ["cash", "card", "upi"],
    },
    status: {
      type: String,
      // enum:["Payment_Completed","Payment_Pending"],
      // default:"Payment_Completed"
    },

   
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", OrderSchema);
module.exports = Order;
