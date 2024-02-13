const mongoose = require("mongoose");

const LoanSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
    },
    customerMobile: {
      type: String,
      required: true,
    },
    customerAddress: {
      type: String,
      required: true,
    },
    items: [
      {
        name: { type: String, required: true },
        descripion: { type: String },
        type: { type: String, default: "gold", required: true },
        quantity: { type: Number ,required: true},
        weight: { type: Number, required: true },
        itemCost: { type: Number, required: true },
      },
    ],
    totalItemCost: { type: Number, required: true },
    loanCost: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    totalInterest: { type: Number,default:0},
    updatedInterest:{type:Number,default:0},
    startDate: { type: Date,default:new Date() },
    lastUpdateDate:{type:Date,default:new Date()},
    updatedLoanCost:{type:Number},
    endDate: { type: Date },
    // remainingInterest: { type: Number },
    transactions: [
      {
        amount: { type: Number, default: 0 },
        paymentType: {
          type: String,
          default: "cash",
          enum: ["cash", "card", "upi"],
        },
        date: { type: Date, default: new Date() },
      },
    ],
    discount_amount: { type: Number },
    status: { type: String, default: "pending", enum: ["pending", "closed","closed with discount"] },
  },

  { timestamps: true }
);
const Loan = mongoose.model("Loan", LoanSchema);

module.exports = Loan;
