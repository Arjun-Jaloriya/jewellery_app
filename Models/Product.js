const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
    },
   
    price: {
      type: Number,
    },
    user: {
          type: mongoose.ObjectId,
          ref: "Vuser",
      },
    category: {
      type: mongoose.ObjectId,
      ref: "Category",
    },
    vendor:{
        type:mongoose.ObjectId,
        ref:"Vendor"
    },
    quantity: {
      type: Number,
    },
    date: {
      type: String,
    },
    total: {
      type: Number,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
