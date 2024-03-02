const backup = require("mongodb-backup");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
const getDashboard = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, msg: "error in getDashboard", error });
  }
};
// const backupData = async (req, res) => {
//   try {
//     console.log("Starting database backup...");
//     // console.log(process.env.DEMO_MONGO_URI);

//     backup({
//       uri: process.env.DEMO_MONGO_URI,
//       root: "G:/backup",
//     });
//     console.log("Database backup completed successfully.");
//   } catch (error) {
//     console.log(error);
//     return res
//       .status(500)
//       .send({ success: false, msg: "error in backup", error });
//   }
// };
module.exports = { getDashboard };
