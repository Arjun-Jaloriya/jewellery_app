const express = require("express");
const { add_transaction ,get_transaction,update_transaction} = require("../Controllers/transaction");
const { issignin } = require("../Middleware/authmiddleware");
const transactionrouter = express.Router();


transactionrouter.post("/add-transaction",issignin,add_transaction);
transactionrouter.get("/get-transaction/:id",issignin,get_transaction);
transactionrouter.put("/update-transaction/:id",issignin,update_transaction);

module.exports = transactionrouter;
