const backup = require("mongodb-backup");
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
    const orderCount = await Order.find({
      $and: [{ date: { $gte: startDateTime, $lte: endDateTime } }],
    });

    // if (orderCount.length > 0) {
      const OrderPendingData = await Order.find({
        $and: [
          { date: { $gte: startDateTime, $lte: endDateTime } },
          { status: "Pending" },
        ],
      });
      const countData = orderCount.map((data) => {
        return data.total_amount;
      });
      const totalRevenue = countData.reduce((sum, all) => {
        return sum + all;
      });
      
    // }

    const emiCount = await Emi.find({
      $and: [{ date: { $gte: startDateTime, $lte: endDateTime } }],
    });
    // if(emiCount.length > 0){
      const pendingEmi = await Emi.find({
        $and: [
          { date: { $gte: startDateTime, $lte: endDateTime } },
          { status: "Pending" },
        ],
      });
      const emiData = pendingEmi.map((data)=>{
        return data.total_creditamount;
      })
      const totalEmiRevenue = emiData.reduce((sum,all)=>{
        return sum+all;
      })

    // }
    const loanCount = await Loan.find({
      $and:[{date:{$gte:startDateTime,$lte:endDateTime}}]
    })

    const pendingLoan = await Loan.find({
      $and:[{date:{$gte:startDateTime,$lte:endDateTime}},[{status:"Pending"}]]
    })

    const loanData = loanCount.map((data)=>{
      return data.loanCost;
    })

    const totalLoanRevenue = loanData.reduce((sum,all)=>{
      return sum+all;
    })
    res.status(200).send({
      success: true,
      order: {
        count: orderCount.length,
        pending: OrderPendingData.length,
        revenue: totalRevenue,
      },
     
      loan:{
        count:loanCount,length,
        pending:pendingLoan.length,
        revenue:totalLoanRevenue
      },
      emi:{
        count:emiCount,length,
        pending:pendingEmi.length,
        revenue:totalEmiRevenue
      },
      orderChart:[
        {
          name:'Total Orders',
          data:[
            
          ]
        }
      ]

      
    });
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
