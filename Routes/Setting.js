const express = require("express");
const SettingRouter = express.Router();

const {addRate} = require("../Controllers/Setting");
const {issignin} = require("../Middleware/authmiddleware");

SettingRouter.post("/addRate",issignin,addRate);

module.exports = SettingRouter;