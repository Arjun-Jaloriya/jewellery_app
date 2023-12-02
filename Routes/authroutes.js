const express = require("express");
const router = express.Router();

const {register,login} = require("../Controllers/authcontroller");


router.post("/register",register);
router.post("/login",login);
router.get("/test",(req,res)=>{
res.json("hello");
})

module.exports = router;

