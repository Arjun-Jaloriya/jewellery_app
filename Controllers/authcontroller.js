const bcrypt = require("bcrypt");
const { User } = require("../Models/User");
const { Vendor } = require("../Models/Vendor");
const { Vuser } = require("../Models/Vuser");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { name, email, password, phone, address, role, status } = req.body;

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
    }
    const existinguser = await User.findOne({ email });

    if (existinguser) {
      return res.status(400).send({
        success: true,
        msg: "User Allready Register please login",
      });
    }
    const hashpassword = await bcrypt.hash(password, 10);

    const userdata = new User({
      name: name,
      email: email,
      password: hashpassword,
      address: address,
      phone: phone,
    });
    await userdata.save();
    res.status(200).send({
      success: true,
      msg: "User Register Successfully",
      userdata,
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

    const user = await User.findOne({ email: email });

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
      expiresIn: "7d",
    });

    user.tokens = await user.tokens.concat({ token: token });
    await user.save();
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
        vendor_id: user.vendor_id,
      },
      token,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      msg: "error in login",
    });
  }
};

const addvendor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      address,
      role,
      status,
      aadharno,
      pan,
      accountno,
      ifsc,
      startdate,
      enddate,
    } = req.body;

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

      case !aadharno:
        return res.send({ message: "aadharno is Required" });

      case !pan:
        return res.send({ message: "pan is Required" });

      case !accountno:
        return res.send({ message: "accountno is Required" });

      case !ifsc:
        return res.send({ message: "ifsc is Required" });

      case !startdate:
        return res.send({ message: "startdate is Required" });
      case !enddate:
        return res.send({ message: "enddate is Required" });
    }
    const existinguser = await Vendor.findOne({ email });

    if (existinguser) {
      return res.status(400).send({
        success: true,
        msg: "vendor Allready Register",
      });
    }

    const existingphone = await Vendor.findOne({ phone });

    if (existingphone) {
      return res.status(400).send({
        success: true,
        msg: "phone number Allready Register",
      });
    }
    const hashpassword = await bcrypt.hash(password, 10);

    const vendordata = new Vendor({
      name: name,
      email: email,
      phone: phone,
      password: hashpassword,
      address: address,
      aadharno: aadharno,
      pan: pan,
      startdate: startdate,
      enddate: enddate,
      ifsc: ifsc,
      accountno: accountno,
    });

    await vendordata.save();
    const existingphone1 = await User.findOne({ phone });

    if (existingphone1) {
      return res.status(400).send({
        success: true,
        msg: "phone number Allready Register",
      });
    }

    const vendordata1 = new User({
      name: name,
      email: email,
      phone: phone,
      password: hashpassword,
      address: address,
      vendor_id: vendordata._id,
    });

    vendordata1.save();
    res.status(200).send({
      success: true,
      msg: "Vendor added Successfully",
      vendordata,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      msg: "error in add-vendor",
      error,
    });
  }
};

const editvendor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      address,
      role,
      status,
      aadharno,
      pan,
      accountno,
      ifsc,
      startdate,
      enddate,
    } = req.body;

    const vdata = await Vendor.findById(req.params.id);
    const userdata = await User.findOne({ vendor_id: req.params.id });
    const existingphone = await Vendor.findOne({ phone });

    if (existingphone) {
      return res.status(400).send({
        success: true,
        msg: "phone number Allready Register",
      });
    }

    const hashedpassword = password
      ? await bcrypt.hash(password, 10)
      : undefined;

    const vendordata = await Vendor.findByIdAndUpdate(
      req.params.id,
      {
        name: name,
        email: email,
        phone: phone,
        address: address,
        password: hashedpassword || vdata.password,
        ifsc: ifsc,
        accountno: accountno,
        aadharno: aadharno,
        pan: pan,
        startdate: startdate,
        enddate: enddate,
      },
      { new: true }
    );

    await vendordata.save();
    const existingphone1 = await User.findOne({ phone });

    if (existingphone1) {
      return res.status(400).send({
        success: true,
        msg: "phone number Allready Register",
      });
    }
    const vendordata1 = await User.findOneAndUpdate(
      { vendor_id: req.params.id },
      {
        name: name,
        email: email,
        phone: phone,
        password: hashedpassword || userdata.password,
        address: address,
      }
    );

    vendordata1.save();
    res.status(200).send({
      success: true,
      msg: `update vendor successfully`,
      vendordata,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      msg: "error in update-vendor",
      error,
    });
  }
};

const viewallvendor = async (req, res) => {
  try {
    const vendordata = await Vendor.find({});
    const activevendors = await Vendor.find({ status: 1 });
    if (vendordata && activevendors) {
      res.status(200).send({
        success: true,
        msg: "vendors fetched successfully",
        count: vendordata.length,
        vendordata,
        active_vendor_count: activevendors.length,
      });
    } else {
      return res.json("no Vendors found");
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      msg: "error in getallvendors",
      error,
    });
  }
};

const deletevendor = async (req, res) => {
  try {
    const { id } = req.params;
    const vendordata = await Vendor.findByIdAndDelete(id);
    res.status(200).send({
      success: true,
      msg: "vendor deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      msg: "error in delete-vendor",
      error,
    });
  }
};

const profileupdate = async (req, res) => {
  try {
    var { name, email, password, phone, address } = req.body;

    const user = await User.findById(req.user._id);

    //password
    if (password && password.length < 6) {
      return res.json({ error: "Passsword is required and 6 character long" });
    }

    if (password == null) {
      password = user.password;
    } else {
      password = await bcrypt.hash(password, 10);
    }

    var updatedata = await User.findByIdAndUpdate(
      req.user._id,
      {
        name: name,
        email: email,
        password: password,
        phone: phone,
        address: address,
      },
      { new: true }
    );

    await updatedata.save();

    res.status(200).send({
      msg: "updated successfully",
      updatedata,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: true,
      msg: "error in update profile-superadmin",
    });
  }
};

const addvuser = async (req, res) => {
  try {
    const { name, email, password, phone, address, aadharno, pan } = req.body;

    switch (true) {
      case !name:
        return res.send({ error: "Name is Required" });

      case !password:
        return res.send({ message: "Password is Required" });

      case !phone:
        return res.send({ message: "Phone no is Required" });

      case !address:
        return res.send({ message: "Address is Required" });

      case !aadharno:
        return res.send({ message: "aadharno is Required" });
    }

    const existingvuser = await Vuser.findOne({ email });

    if (existingvuser) {
      return res.status(400).send({
        success: true,
        msg: "Vuser Allready Register",
      });
    }
    const existingaadhar = await Vuser.findOne({ aadharno });

    if (existingaadhar) {
      return res.status(400).send({
        success: true,
        msg: "aadhar Allready Register",
      });
    }

    const existingphone = await Vuser.findOne({ phone });

    if (existingphone) {
      return res.status(400).send({
        success: true,
        msg: "phone number Allready Register",
      });
    }

    const existingpan = await Vuser.findOne({ pan });

    if (existingpan) {
      return res.status(400).send({
        success: true,
        msg: "pan Allready Register",
      });
    }

    const hashpassword = await bcrypt.hash(password, 10);

    const vuserdata = new Vuser({
      name: name,
      email: email,
      phone: phone,
      password: hashpassword,
      address: address,
      aadharno: aadharno,
      pan: pan,
      vendor_id: req.user.id,
    });

    await vuserdata.save();

    const existingphone1 = await User.findOne({ phone });

    if (existingphone1) {
      return res.status(400).send({
        success: true,
        msg: "phone number Allready Register",
      });
    }
    const existinguser = await User.findOne({ email });

    if (existinguser) {
      return res.status(400).send({
        success: true,
        msg: "user Allready Register",
      });
    }
    const existingpan1 = await User.findOne({ pan });

    if (existingpan1) {
      return res.status(400).send({
        success: true,
        msg: "pan Allready Register",
      });
    }
    const vuserdata1 = new User({
      name: name,
      email: email,
      phone: phone,
      password: hashpassword,
      address: address,
      vuser_id: vuserdata._id,
      vendor_id: vuserdata.vendor_id,
    });

    vuserdata1.save();
    res.status(200).send({
      success: true,
      msg: "Vuser added Successfully",
      vuserdata,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      msg: "error in add-Vuser",
      error,
    });
  }
};

const editvuser = async (req, res) => {
  try {
    const { name, email, phone, password, address, aadharno, pan } = req.body;

    switch (true) {
      case !name:
        return res.send({ error: "Name is Required" });

      case !phone:
        return res.send({ message: "Phone no is Required" });

      case !address:
        return res.send({ message: "Address is Required" });

      case !aadharno:
        return res.send({ message: "aadharno is Required" });
    }
    const vuserinfo = await Vuser.findById({ _id: req.params.id });

    const hashedpassword = password
      ? await bcrypt.hash(password, 10)
      : undefined;

    const vuserdata = await Vuser.findByIdAndUpdate(
      req.params.id,
      {
        name: name,
        email: email,
        phone: phone,
        password: hashedpassword || vuserinfo.password,
        address: address,
        aadharno: aadharno,
        pan: pan,
      },
      { new: true }
    );

    await vuserdata.save();
    const userinfo = await User.findOne({ vuser_id: req.params.id });

    const vuserdata1 = await User.findOneAndUpdate(
      { vuser_id: req.params.id },
      {
        name: name,
        email: email,
        password: hashedpassword || userinfo.password,
        phone: phone,
        address: address,
        aadharno: aadharno,
        pan: pan,
      },
      { new: true }
    );

    vuserdata1.save();
    res.status(200).send({
      success: true,
      msg: `${name} vuser updated successfully`,
    });
  } catch (error) {
    console.log(error);
   return res.status(500).send({
      success: false,
      msg: "error in update-vuser",
      error,
    });
  }
};

const getvuser_vendorwise = async (req, res) => {
  try {
    const vuserdata = await Vuser.find({ vendor_id: req.user._id });

    res.status(200).send({
      success: true,
      msg: "all venodorwise-vuser fetched successfully",
      count: vuserdata.length,
      vuserdata,
    });
  } catch (error) {
    console.log(error);
  return res.status(500).send({
      success: false,
      msg: "error in venodorwisevuser",
      error,
    });
  }
};

const delete_vuser = async(req,res)=>{
  try {
    const deletevuserdata = await Vuser.findByIdAndDelete(req.params.id);
    res.status(200).send({
      success: true,
      msg: "delete vuser successfully",
    });
  } catch (error) {
    console.log(error);
   return res.status(500).send({
      success: false,
      msg: "error in delete-vuser",
      error,
    });
  }
}
module.exports = {
  register,
  login,
  addvendor,
  editvendor,
  viewallvendor,
  deletevendor,
  profileupdate,
  addvuser,
  editvuser,
  getvuser_vendorwise,
  delete_vuser
};
