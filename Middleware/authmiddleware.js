const jwt = require("jsonwebtoken");
const { User } = require("../Models/User");

const issignin = async (req, res, next) => {
  try {
    const token = await req.headers.authorization;
    if (token) {
      const verifyuser = jwt.verify(token, process.env.JWT_SECRET);

      if (!verifyuser) {
        return res.status(404).send({
          success: false,
          msg: "Access Denied",
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
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).send({
        success: false,
        msg: "Token has expired",
      });
    }

    console.error(error);
    return res.status(500).send({
      success: false,
      msg: "Something went wrong",
      error,
    });
  }
};

module.exports = { issignin };
