const backup = require("mongodb-backup");
const getDashboard = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, msg: "error in getDashboard", error });
  }
};
const backupData = async (req, res) => {
  try {
    console.log("Starting database backup...");
    await backup({
      uri: process.env.MONGO_URI, // Ensure this URI is correct
      root: __dirname + '/G:/backup'
    });
    console.log("Database backup completed successfully.");
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, msg: "error in backup", error });
  }
};
module.exports = { getDashboard, backupData };
