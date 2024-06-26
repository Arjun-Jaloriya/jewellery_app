const express = require("express");
const { add_transaction ,get_transaction,update_transaction,Get_Allorders,pending_status,cancel_order,discount,edittransaction,deleteTransaction} = require("../Controllers/transaction");
const { issignin } = require("../Middleware/authmiddleware");
const transactionrouter = express.Router();


transactionrouter.post("/add-transaction",issignin,add_transaction);
transactionrouter.get("/get-transaction/:id",issignin,get_transaction);
transactionrouter.put("/update-transaction/:id",issignin,update_transaction);
transactionrouter.get("/getallorders",issignin,Get_Allorders);
//pending status data
transactionrouter.get("/pendingstatus",issignin,pending_status);
transactionrouter.put("/cancel-order/:id",issignin,cancel_order);
//discount
transactionrouter.put("/discount/:id",issignin,discount);
//editTransaction
transactionrouter.put("/editTransaction/:id",issignin,edittransaction);
//delete-transaction
transactionrouter.delete("/deleteTransaction/:orderId/:transactionId",issignin,deleteTransaction);

//email
// transactionrouter.get("/send-email",issignin,sendemail);



module.exports = transactionrouter;
