const express = require("express");
const Loanrouter = express.Router();
const { issignin } = require("../Middleware/authmiddleware");
const {addLoan,updateinterest,add_loantransaction,update_loantransaction} = require("../Controllers/Loan");

Loanrouter.post("/add-Loan", issignin, addLoan);
Loanrouter.put("/update-interest/:id",issignin,updateinterest);
Loanrouter.put("/update-loantransaction/:id",issignin,update_loantransaction);


module.exports = Loanrouter;
