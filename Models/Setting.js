const mongoose = require("mongoose");

const SettingSchema = new mongoose.Schema(
  {
    goldRate: {
      type: Number,
      default: 0,
    },
    silverRate: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Setting = mongoose.model("Setting", SettingSchema);

module.exports = Setting;
