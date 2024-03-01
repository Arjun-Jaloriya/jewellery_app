const express = require("express");
const { issignin } = require("../Middleware/authmiddleware");
const { getDashboard,backupData } = require("../Controllers/dashboard");
const dashboardRouter = express.Router();

dashboardRouter.get("/dashboard",issignin,getDashboard);
dashboardRouter.get("/backup",issignin,backupData);

module.exports = dashboardRouter;