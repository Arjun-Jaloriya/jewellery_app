const bcrypt = require("bcrypt");
const { User } = require("../Models/User");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { name, email, password, phone, address, role, status ,shopName} = req.body;

    switch (true) {
      case !name:
        return res.send({ error: "Name is Required" });

      case !email:
        return res.send({ message: "Email is Required" });

      case !password:
        return res.send({ message: "Password is Required" });

      case !phone:
        return res.send({ message: "Phone no is Required" });

      case !address:
        return res.send({ message: "Address is Required" });
        case !shopName:
        return res.send({ message: "shopName is Required" });
    }
    const existinguser = await User.findOne({ email });

    if (existinguser) {
      return res.status(400).send({
        success: true,
        msg: "User Allready Register please login",
      });
    }
    const hashPassword = await bcrypt.hash(password, 10);

    const userData = new User({
      name: name,
      email: email,
      password: hashPassword,
      address: address,
      phone: phone,
      shopName:shopName
    });
    await userData.save();
    res.status(200).send({
      success: true,
      msg: "User Register Successfully",
      results:userData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      msg: "error in register",
      error,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.send({ message: "Email and password is Required" });
    }

    let user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).send({
        success: false,
        msg: "email is not registred",
      });
    }

    const matchpass = await bcrypt.compare(password, user.password);

    if (!matchpass) {
      return res.status(404).send({
        success: false,
        msg: "invalid email or password",
      });
    }
    if (!user.status == 1) {
      return res.status(404).send({
        success: false,
        msg: "sorry you cannot login",
      });
    }

    const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    user.token = await User.findByIdAndUpdate(
      user._id,
      { token: token },
      { new: true }
    );
 
    res.status(200).send({
      success: true,
      msg: `${user.name}-you are successfully login`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        shopName:user.shopName
      },
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      msg: "error in login",
      error
    });
  }
};


const Profile_Token = async (req, res) => {
  try {
    const token = req.headers.authorization // Extract token from Authorization header

    if (!token) {
      return res.status(401).send({
        success: false,
        msg: "No token provided",
      });
    }

    res.status(200).send({
      success: true,
      msg: "You have a valid token",
      user: req.user,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success:false,
      msg:"something went wrong",
    })
  }
};

module.exports = { register, login, Profile_Token };
