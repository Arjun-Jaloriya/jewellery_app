const express = require("express");
const { add_transaction ,get_transaction,update_transaction} = require("../Controllers/transaction");
// const { issignin } = require("../middleware/authmiddleware");
const transactionrouter = express.Router();


transactionrouter.post("/add-transaction",add_transaction);
transactionrouter.get("/get-transaction/:id",get_transaction);
transactionrouter.put("/update-transaction/:id",update_transaction);

module.exports = transactionrouter;
