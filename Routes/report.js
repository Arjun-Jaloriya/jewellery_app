const express = require("express");
const { typeWiseReport ,yearWiseReport} = require("../Controllers/report");
const reportRouter = express.Router();
const { issignin } = require("../Middleware/authmiddleware");

//typewise report gold,silver
reportRouter.get("/typewise-report/:type",issignin,typeWiseReport);
//yearly total-sell
reportRouter.get("/yearwise-report",issignin,yearWiseReport);



module.exports = reportRouter;