const express = require("express");
const Loanrouter = express.Router();
const { issignin } = require("../Middleware/authmiddleware");
const {addLoan,updateinterest,update_loantransaction,getallLoan,getLoanById,discount,deleteLoan} = require("../Controllers/Loan");

Loanrouter.post("/add-Loan", issignin, addLoan);
Loanrouter.put("/update-interest/:id",issignin,updateinterest);
Loanrouter.put("/update-loantransaction/:id",issignin,update_loantransaction);
Loanrouter.get("/getLoanbyid/:id",issignin,getLoanById)
//pagination
Loanrouter.get("/getLoanData",issignin,getallLoan);
Loanrouter.put("/discountLoan/:id",issignin,discount);




module.exports = Loanrouter;
