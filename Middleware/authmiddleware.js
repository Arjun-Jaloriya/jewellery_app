const jwt = require("jsonwebtoken");
const {User} = require("../Models/User");

 const issignin = async(req,res,next)=>{
    try {
        const token = await req.headers.authorization;
        if(token){
          const verifyuser = jwt.verify(token, process.env.JWT_SECRET);
          if(!verifyuser){
            return res.send("please login")
          }
          req.user= await User.findOne({_id:verifyuser._id});
          next();
        }else{
        return res.send("please login")
        }
    } catch (error) {
      // console.log(error);
    }
}

module.exports = {issignin};
