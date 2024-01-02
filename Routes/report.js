const express = require("express");
const { typeWiseReport ,customReport,exportexcel} = require("../Controllers/report");
const reportRouter = express.Router();
const { issignin } = require("../Middleware/authmiddleware");

//typewise report gold,silver
reportRouter.get("/typewise-report",issignin,typeWiseReport);
//yearly total-sell
reportRouter.get("/customDate-report",issignin,customReport);
//export excel
reportRouter.get("/export",issignin,exportexcel),



module.exports = reportRouter;