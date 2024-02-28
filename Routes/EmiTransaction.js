const express = require("express");
const { issignin } = require("../Middleware/authmiddleware");
const { add_emitransaction,update_Emi,get_emitransaction,withdraw,recent_withdraw,maturityEmi,getEmiById,deleteemi } = require("../Controllers/emi");
const emirouter = express.Router();

//add emi
emirouter.post("/add-emitransaction",issignin,add_emitransaction);
//update emi
emirouter.put("/update-emi/:id",issignin,update_Emi);
//getallemi-transaction
emirouter.get("/get-emitransaction",issignin,get_emitransaction);
//getemibyid
emirouter.get("/get-emi/:id", issignin, getEmiById);
//withdraw
emirouter.put("/withdraw/:id",issignin,withdraw);
//recent-withdraw-date
emirouter.post("/recent-withdraw",issignin,recent_withdraw);
//
emirouter.get("/maturity-emi",issignin,maturityEmi)






module.exports = emirouter;