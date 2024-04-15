const Loan = require("../Models/Loan");
const cron = require("node-cron");
const nodemailer = require("nodemailer");
const moment = require("moment");
const axios = require("axios");

const addLoan = async (req, res) => {
  try {
    let {
      customerName,
      customerMobile,
      customerAddress,
      items,
      totalItemCost,
      loanCost,
      interestRate,
      updatedInterest,
      transactions,
      startDate,
      lastUpdateDate,
      updatedLoanCost,
      endDate,
      totalInterest,
    } = req.body;

    switch (true) {
      case !customerName:
        return res.send({ error: "customerName is required" });
      case !customerMobile:
        return res.send({ error: "customerMobile is required" });
      case !customerAddress:
        return res.send({ error: "customerAddress is required" });
      // case !transactions:
      //   return res.send({ error: "transactions is required" });
      case !items:
        return res.send({ error: "items is required" });

      case !loanCost:
        return res.send({ error: "loanCost is required" });
      case !interestRate:
        return res.send({ error: "interestRate is required" });
    }

    // const dailyInterest = Math.round((loanCost * interestRate) / 100 / 365);
    // const dailyInterest = ((loanCost * interestRate) / 100 / 365).toFixed(1);
    // console.log(dailyInterest);

    let adddata = await new Loan({
      customerName,
      customerMobile,
      customerAddress,
      items,
      totalItemCost,
      loanCost,
      interestRate,
      transactions,
      totalInterest,
      updatedInterest,
      startDate,
      lastUpdateDate: startDate,
      updatedLoanCost: loanCost,
      endDate,
    }).save();

    res.status(200).send({
      success: true,
      msg: "loan transaction added successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      msg: "error in add-loan",
      error,
    });
  }
};

const updateinterest = async (req, res) => {
  try {
    const olddata = await Loan.findById(req.params.id);

    const currentDate = moment().add(9,'days');
    
    console.log(currentDate.format("DD-MM-YYYY hh:mm a"));

    const lastUpdateDate = moment(olddata.lastUpdateDate).startOf('day');
    console.log(lastUpdateDate.format("DD-MM-YYYY hh:mm a"));

    // Calculate the difference in days
    const daysElapsed = currentDate.diff(lastUpdateDate, "days");
    console.log(daysElapsed);
    if (daysElapsed > 0) {
      const dailyInterest = (
        (olddata.updatedLoanCost * olddata.interestRate) /
        100 /
        365
      ).toFixed(1);

      const totalInterest = parseFloat(dailyInterest) * daysElapsed;

      const updatedata = await Loan.findByIdAndUpdate(
        req.params.id,
        {
          totalInterest: totalInterest + olddata.totalInterest,
          updatedInterest: totalInterest + olddata.updatedInterest,
          lastUpdateDate: currentDate,
        },
        { new: true, useFindAndModify: false }
      );

      res.status(200).send({
        success: true,
        msg: "update daily interest successfully",
        results: updatedata,
      });
    } else {
      return res.status(200).send({
        success: false,
        message: "No update needed for interest",
        totalInterest: olddata.updatedInterest,
        results: olddata,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      msg: "error in update-interest",
      error,
    });
  }
};

const update_loantransaction = async (req, res) => {
  try {
    const { transaction } = req.body;
    let lastloandata = await Loan.findById(req.params.id);

    if (
      transaction[0].amount <=
      lastloandata.updatedLoanCost + lastloandata.updatedInterest
    ) {
      // Subtract deposit amount from total interest
      const updatedTotalInterest = Math.max(
        lastloandata.updatedInterest - transaction[0].amount,
        0
      );

      // Calculate remaining deposit amount after subtracting from total interest
      const remainingDeposit =
        transaction[0].amount -
        (lastloandata.updatedInterest - updatedTotalInterest);
      // console.log(remainingDeposit);

      // Subtract remaining deposit from updated loan cost
      const updatedLoanCost = Math.max(
        lastloandata.updatedLoanCost - remainingDeposit,
        0
      );

      let updateLoanTransaction = await Loan.findByIdAndUpdate(
        req.params.id,
        {
          $push: { transactions: transaction },
          $set: {
            updatedLoanCost: parseFloat(updatedLoanCost).toFixed(2),
            updatedInterest: parseFloat(updatedTotalInterest).toFixed(2),
          },
        },
        { new: true, useFindAndModify: false }
      );

      // console.log(updatedLoanCost);
      // console.log(parseFloat(updatedLoanCost).toFixed(0));

      if (parseFloat(updatedLoanCost).toFixed(0) <= 0) {
        let updatestatus = await Loan.findByIdAndUpdate(
          req.params.id,
          {
            status: "closed",
          },
          { new: true, useFindAndModify: false }
        );
        return res.status(200).send({
          success: true,
          msg: "your Loan is closed",
          results: updatestatus,
          // results: updateLoanTransaction,
        });
      }
      return res.status(200).send({
        success: true,
        msg: "successfully added loan transaction",
        results: updateLoanTransaction,
      });
    } else {
      return res.status(200).send({
        success: false,
        msg: `please enter amount less than ${updatedLoanCost + lastloandata.updatedInterest}`,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      msg: "error in update-loantransaction",
    });
  }
};

const getallLoan = async (req, res) => {
  try {
    const search = req.query.search ? req.query.search : "";
    const perpage = req.query.perpage ? req.query.perpage : 5;
    const page = req.query.page ? req.query.page : 1;
    const count = await Loan.find({
      $or: [
        {
          customerName: { $regex: search, $options: "i" },
        },
      ],
    });

    const getAllLoan = await Loan.find({
      $or: [{ customerName: { $regex: search, $options: "i" } }],
    })
      .skip((page - 1) * perpage)
      .limit(perpage)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      msg: "search data fetched",
      count: count.length,
      results: getAllLoan,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      msg: "error in get-allLoan",
      error,
    });
  }
};
const discount = async (req, res) => {
  try {
    let { amount } = req.body;
    const oldData = await Loan.findById(req.params.id);
    const oldupdatedLoanCost = oldData.updatedLoanCost;

    if (amount <= oldupdatedLoanCost) {
      const Updatediscount = await Loan.findByIdAndUpdate(
        req.params.id,
        {
          status: "closed with discount",
          discount_amount: amount,
        },
        { new: true, useFindAndModify: false }
      );
      res.status(200).send({
        success: true,
        msg: "discount added and Loan closed",
        results: Updatediscount,
      });
    } else {
      return res.status(200).send({
        success: false,
        msg: "please enter amount less than updatedLoanCost",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      msg: "error in discount",
      error,
    });
  }
};

// const sendemail = async (req, res) => {
//   try {
//     const today = new Date();
//     //  console.log( moment().format('DD-MM-YYYY'));
//     const pendingLoans = await Loan.aggregate([
//       {
//         $match: {
//           status: "pending",
//           $expr: {
//             $eq: [{ $dayOfMonth: "$lastUpdateDate" }, today.getDate()],
//           },
//         },
//       },
//     ]);
//     if (pendingLoans.length > 0) {
//       const getRemainData = pendingLoans.map((data) => {
//         return {
//           name: data.customerName,
//           cost: data.updatedLoanCost,
//         };
//       });

//       // Construct the HTML content for the email body with a table
//       const emailBody = `
//   <html>
//   <head>
//       <style>
//           table {
//               font-family: Arial, sans-serif;
//               border-collapse: collapse;
//               width: 100%;
//           }
//           th, td {
//               border: 1px solid #dddddd;
//               text-align: left;
//               padding: 8px;
//           }
//           th {
//               background-color: #f2f2f2;
//           }
//       </style>
//   </head>
//   <body>
//       <h2>Pending Loan Customers - ${today.toDateString()}</h2>
//       <table>
//           <thead>
//               <tr>
//                   <th>Name</th>
//                   <th>Cost</th>
//               </tr>
//           </thead>
//           <tbody>
//               ${getRemainData
//                 .map(
//                   (item) => `
//                   <tr>
//                       <td>${item.name}</td>
//                       <td>${item.cost}</td>
//                   </tr>
//               `
//                 )
//                 .join("")}
//           </tbody>
//       </table>
//   </body>
//   </html>
// `;

//       // res.status(200).send({
//       //   success: true,
//       //   msg: "please check your email ",
//       // });
//       const tranporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: {
//           user: process.env.SENDEMAIL,
//           pass: process.env.SENDPASSWORD,
//         },
//       });

//       const mailOption = {
//         from: process.env.SENDEMAIL,
//         to: process.env.TOEMAIL,
//         subject: `Date - ${moment().format(
//           "DD-MM-YYYY"
//         )} Pending Loan Customers`,
//         html: emailBody, // Set HTML content
//       };

//       tranporter.sendMail(mailOption, (error, info) => {
//         // if (error) {
//         //   console.log(error.message);
//         //   return res.status(400).json({
//         //     msg: error.msg,
//         //     status: "false",
//         //     statusCode: res.statusCode,
//         //   });
//         // } else {
//         //   res.status(201).json({
//         //     msg: `Email sent ${info.response}`,
//         //     success: true,
//         //     statusCode: res.statusCode,
//         //   });
//         // }
//       });
//     }
//   } catch (error) {
//     console.log(error);
//   }
// };

const getLoanById = async (req, res) => {
  try {
    const LoanData = await Loan.findById(req.params.id);
    res.status(200).send({
      success: true,
      msg: "Loan record fetched by id",
      results: LoanData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      msg: "error in getLoanById",
      error,
    });
  }
};

const deleteLoan = async (req, res) => {
  try {
    const today = new Date();
    const LoanData = await Loan.find({
      $or: [{ status: "Completed" }, { status: "closed with discount" }],
    });

    if (LoanData.length > 0) {
      const modifiedDates = LoanData.map((record) => {
        const modifiedDate = new Date(record.lastUpdateDate);
        modifiedDate.setDate(modifiedDate.getDate() + 15);
        return modifiedDate;
      });

      const todayDateString = today.toDateString();

      // Find records to delete
      const recordsToDelete = LoanData.filter((record, index) => {
        return modifiedDates[index].toDateString() === todayDateString;
      });

      // Extract ids of records to delete
      const idsToDelete = recordsToDelete.map((record) => record._id);

      // Delete records
      const result = await Loan.deleteMany({ _id: { $in: idsToDelete } });
    }
  } catch (error) {
    console.log(error);
  }
};
const cancelLoan = async (req, res) => {
  try {
    const UpadateLoan = await Loan.findByIdAndUpdate(
      req.params.id,
      {
        status: "Cancelled",
      },
      { new: true, useFindAndModify: false }
    );
    res.status(200).send({
      success: true,
      msg: "cancelled loan successfully",
      results: UpadateLoan,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      msg: "error in cancel-Loan",
      error,
    });
  }
};
module.exports = {
  addLoan,
  updateinterest,
  update_loantransaction,
  getallLoan,
  discount,
  // sendemail,
  getLoanById,
  deleteLoan,
  cancelLoan,
};
