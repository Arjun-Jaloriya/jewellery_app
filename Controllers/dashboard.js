// const backup = require("mongodb-backup");
const path = require("path");
const dotenv = require("dotenv");
const Order = require("../Models/Order");
const { Emi } = require("../Models/Emi");
const Loan = require("../Models/Loan");
dotenv.config();
const getDashboard = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const startDateTime = new Date(startDate);
    startDateTime.setHours(0, 0, 0, 0);

    const endDateTime = new Date(endDate);
    endDateTime.setHours(23, 59, 59, 999);
    // console.log(startDateTime, endDateTime);
    let orderCard = {};
    const orderCount = await Order.find({
      $and: [{ date: { $gte: startDateTime, $lte: endDateTime } }],
    });
    if (orderCount.length > 0) {
      const orderPendingData = await Order.find({
        $and: [
          { date: { $gte: startDateTime, $lte: endDateTime } },
          { status: "Pending" },
        ],
      });
      const countData = orderCount.map((data) => data.total_amount);
      const totalRevenue = countData.reduce((sum, all) => sum + all, 0);
      const orderPercentage =
        orderCount.length > 0 ? (orderPendingData.length / orderCount.length) * 100 : 0;

      orderCard = {
        count: orderCount.length,
        pending: orderPendingData.length,
        revenue: totalRevenue,
        percentage: orderPercentage,
      };
      const monthlyOrderCount = Array(12).fill(0);
      const monthlyRevenue = Array(12).fill(0);

      orderCount.forEach(order => {
        const month = order.date.getMonth();
        monthlyOrderCount[month]++;
        monthlyRevenue[month] += order.total_amount;
      });

      // Add monthly data to the response object
      orderCard.monthlyOrderCount = monthlyOrderCount;
      orderCard.monthlyRevenue = monthlyRevenue;
    }
    

    const emiCount = await Emi.find({
      $and: [{ createdAt: { $gte: startDateTime, $lte: endDateTime } }],
    });

    let emiCard = {};
    if (emiCount.length > 0) {
      const pendingEmi = await Emi.find({
        $and: [
          { createdAt: { $gte: startDateTime, $lte: endDateTime } },
          { status: "pending" },
        ],
      });
      const emiData = pendingEmi.map((data) => data.total_creditamount);
      const totalEmiRevenue = emiData.reduce((sum, all) => sum + all, 0);
      const emiPercentage = emiCount.length > 0 ? (pendingEmi.length / emiCount.length) * 100 : 0;

      emiCard = {
        count: emiCount.length,
        pending: pendingEmi.length,
        revenue: totalEmiRevenue,
        percentage: emiPercentage,
      };
    }

    const loanCount = await Loan.find({
      $and: [{ createdAt: { $gte: startDateTime, $lte: endDateTime } }],
    });

    let loanCard = {};
    if (loanCount.length > 0) {
      const pendingLoan = await Loan.find({
        $and: [
          { createdAt: { $gte: startDateTime, $lte: endDateTime } },
          { status: "Pending" },
        ],
      });
      const loanData = loanCount.map((data) => data.loanCost);
      const totalLoanRevenue = loanData.reduce((sum, all) => sum + all, 0);
      const loanPercentage = loanCount.length > 0 ? (pendingLoan.length / loanCount.length) * 100 : 0;

      loanCard = {
        count: loanCount.length,
        pending: pendingLoan.length,
        revenue: totalLoanRevenue,
        percentage: loanPercentage,
      };
    }

    res.status(200).send({ orderCard, emiCard, loanCard });
    
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
