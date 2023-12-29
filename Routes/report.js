const express = require("express");
const { typeWiseReport ,customReport} = require("../Controllers/report");
const reportRouter = express.Router();
const { issignin } = require("../Middleware/authmiddleware");

//typewise report gold,silver
reportRouter.get("/typewise-report/:type",issignin,typeWiseReport);
//yearly total-sell
reportRouter.get("/customDate-report",issignin,customReport);



module.exports = reportRouter;