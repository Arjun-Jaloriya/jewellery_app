const express = require("express");
const router = express.Router();

const {register,login,addvendor,editvendor,deletevendor,viewallvendor,profileupdate,addvuser,editvuser,getvuser_vendorwise,delete_vuser} = require("../Controllers/authcontroller");
const {issignin,issuperadmin,isadmin} = require("../Middleware/authmiddleware");


//superadmin routes

//superadmin register
router.post("/register",register);
router.post("/login",login);

router.post("/add-vendor",issignin,issuperadmin,addvendor);
router.put("/editvendor/:id",issignin,issuperadmin,editvendor);
router.get("/get-vendors",issignin,issuperadmin,viewallvendor);
router.delete("/delete-vendor/:id",issignin,issuperadmin,deletevendor);
//profile update for superadmin
router.post("/profile",issignin,issuperadmin,profileupdate);


//admin routes(vendor)

//add vuser
router.post("/add-vuser",issignin,isadmin,addvuser);
//edit vuser
router.put("/edit-vuser/:id",issignin,isadmin,editvuser);
//get vusers vendor wise
router.get("/get-vuser",issignin,isadmin,getvuser_vendorwise);
//delete-vuser
router.delete("/delete-vuser/:id",issignin,isadmin,delete_vuser)

module.exports = router;

