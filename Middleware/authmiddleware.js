const jwt = require("jsonwebtoken");
const { User } = require("../Models/User");

const issignin = async (req, res, next) => {
  try {
    const token = await req.headers.authorization;
    if (token) {
      const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds
      const verifyuser = jwt.verify(token, process.env.JWT_SECRET);
     
      
      if (!verifyuser) {
        return res.status(404).send({
          success: false,
          msg: "Access Denied"
        });
      }
      if (verifyuser.exp < currentTime) {
        return res.status(401).send({
          success: false,
          msg: "Token has expired",
        });
      }
      req.user = await User.findOne({ _id: verifyuser._id });
      next();
    } else {
      return res.status(404).send({
        success: false,
        msg: "please login",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success:false,
      msg:"something went wrong",
      error
    })
  }
};

module.exports = { issignin };
