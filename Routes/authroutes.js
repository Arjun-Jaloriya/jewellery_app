const express = require("express");
const router = express.Router();

const {register,login,Profile_Token} = require("../Controllers/authcontroller");
const {issignin} = require("../Middleware/authmiddleware");

router.post("/register",register);
router.post("/login",login);
router.get("/profile",issignin,Profile_Token);
router.get("/test",(req,res)=>{
res.json("hello");
})

module.exports = router;

