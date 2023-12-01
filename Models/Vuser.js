const mongoose = require("mongoose");
const bcrypt = require("bcrypt")
const VuserSchema = new mongoose.Schema(
    {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        email: {
          type: String,
          unique: true,
        },
        phone: {
          type: Number,
          required: true,
          unique: true,
        },
        password:{
            type:String,
            required:true
        },
        address: {
          type: {},
          required: true,
        },
        aadharno:{
            type:Number,
            required:true,
            unique: true,
        },
        pan:{
            type:String,
            unique: true,
          },
        vendor_id:{
          type: mongoose.ObjectId,
            ref: "Vendor",
          },
      
      },
      { timestamps: true }
    );
    
    // //password hash
    // VuserSchema.pre("save", async function (next) {
    //   if (this.isModified("password")) {
    //     this.password = await bcrypt.hash(this.password, 10);
    //   }
    //   next();
    // });
    
    const Vuser = mongoose.model("Vuser", VuserSchema);
    
    module.exports = { Vuser };
    
