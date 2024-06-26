const { Emi } = require("../Models/Emi");
const moment = require("moment");

const add_emitransaction = async (req, res) => {
  try {
    const {
      customerName,
      customerMobile,
      address,
      fixed_Emi,
      total_creditamount,
      transactions,
      maturityDate,
      TotalInterest,
      maturityAmount,
    } = req.body;

    switch (true) {
      case !customerName:
        return res.send({ error: "customerName is required" });
      case !customerMobile:
        return res.send({ error: "customerMobile is required" });
      case !address:
        return res.send({ error: "address is required" });
      case !transactions:
        return res.send({ error: "transactions is required" });
      case !fixed_Emi:
        return res.send({ error: "fixed_Emi is required" });
    }
    const today = new Date();
    let next2Year = new Date(today);
    next2Year.setFullYear(today.getFullYear() + 2);

    const add_emi = await new Emi({
      customerName,
      customerMobile,
      address,
      fixed_Emi,
      transactions,
      total_creditamount: transactions[0].amount,
      maturityDate: next2Year,
      maturityAmount,
      TotalInterest,
    }).save();
    res.status(200).send({
      success: true,
      msg: "successfully added transaction",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      msg: "error in add-emi_transaction",
      error,
    });
  }
};

const update_Emi = async (req, res) => {
  try {
    const { transactions } = req.body;
    let lastemi = await Emi.findById(req.params.id);
    const matureAmount = lastemi.fixed_Emi;
    // console.log(matureAmount);
    const totalMatureAmount = matureAmount * 24;
    // console.log(totalMatureAmount);
    if (
      lastemi.total_creditamount + transactions[0].amount <=
      totalMatureAmount
    ) {
      let lastamount = lastemi.total_creditamount;

      let updatedamount = lastamount + transactions[0].amount;

      let update_Totalamount = await Emi.findByIdAndUpdate(
        req.params.id,
        {
          $push: { transactions: transactions },
          $set: { total_creditamount: updatedamount },
        },
        { new: true, useFindAndModify: false }
      );
      res.status(200).send({
        success: true,
        msg: "update emi successfully",
        results: update_Totalamount,
      });
    } else {
      return res.status(500).send({
        success: false,
        msg: "please enter amount less than totalMatureAmount",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      msg: "error in update-emi_transaction",
      error,
    });
  }
};

const get_emitransaction = async (req, res) => {
  try {
    const search = req.query.search ? req.query.search : "";
    const perpage = req.query.perpage ? req.query.perpage : 5;
    const page = req.query.page ? req.query.page : 1;
    const count = await Emi.find({
      $or: [
        {
          customerName: { $regex: search, $options: "i" },
        },
      ],
    });

    const getEmiData = await Emi.find({
      $or: [{ customerName: { $regex: search, $options: "i" } }],
    })
      .skip((page - 1) * perpage)
      .limit(perpage)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      msg: "search data fetched",
      count: count.length,
      results: getEmiData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      msg: "error in get-EmiData",
      error,
    });
  }
};

const withdraw = async (req, res) => {
  try {
    const oldData = await Emi.findById(req.params.id);
    let oldDate = oldData[0].date;
    const oldTotal_creditamount = oldData[0].fixed_Emi;
    const currDate = new Date();
    if (oldDate < currDate) {
      return res.status(200).send({
        success: true,
        msg: "you cannot withdraw money until your maturity date is not coming",
      });
    } else {
      let updatewithdraw = await Emi.findByIdAndUpdate(
        req.params.id,
        {
          status: "withdraw",
        },
        {
          new: true,
          useFindAndModify: false,
        }
      );
      res.status(200).send({
        success: true,
        msg: "withdraw money successfull",
        results: updatewithdraw,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      msg: "error in withdraw-emi_transaction",
      error,
    });
  }
};

const recent_withdraw = async (req, res) => {
  try {
    const search = req.query.search ? req.query.search : "";
    const perpage = req.query.perpage ? req.query.perpage : 5;
    const page = req.query.page ? req.query.page : 1;
    const { frequency } = req.query;
    const withdrawdata = await Emi.find({
      $and: [
        {
          createdAt: {
            $gt: moment().subtract(Number(frequency), "d").toDate(),
          },
        },
        { customerName: { $regex: search, $options: "i" } },
      ],
    })
      .skip((page - 1) * perpage)
      .limit(perpage)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      msg: "fetched recent withdraw successfully",
      count: withdrawdata.length,
      results: withdrawdata,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      msg: "error in recent-withdraw",
      error,
    });
  }
};

const maturityEmi = async (req, res) => {
  try {
    const today = new Date();
    // Find all pending records
    const getPendingData = await Emi.find({ status: "pending" });

    if (getPendingData.length > 0) {
    }
    // Iterate through each pending record
    for (const data of getPendingData) {
      const maturityDate = data.maturityDate;
      const totalCreditAmount = data.total_creditamount;
      // Calculate the maturity date after 24 months

      // Check if the maturity date is today
      if (isSameDate(maturityDate, today)) {
        // Calculate total interest and sum of amount

        const totalInterest = calculateTotalInterest(totalCreditAmount);

        // Calculate maturity amount
        const maturityAmount = totalCreditAmount + totalInterest;
        // Update the record with status="mature", totalInterest, and maturityAmount
        await Emi.findByIdAndUpdate(
          data._id,
          {
            $set: {
              status: "mature",
              TotalInterest: totalInterest,
              maturityAmount: maturityAmount,
              maturityDate: maturityDate,
            },
          },
          { new: true, useFindAndModify: false }
        );

        // console.log(`Record with _id ${data._id} updated.`);
      }
    }

    // Function to check if two dates have the same day, month, and year
    function isSameDate(date1, date2) {
      return (
        date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()
      );
    }

    function calculateTotalInterest(totalCreditAmount) {
      const interestRate = 0.15; // 15% interest rate
      const totalInterest = totalCreditAmount * interestRate;
      return totalInterest;
    }
  } catch (error) {
    console.log(error);
  }
};

const getEmiById = async (req, res) => {
  try {
    const getEmiData = await Emi.findById(req.params.id);
    res.status(200).send({
      success: true,
      msg: "record fetched by id",
      results: getEmiData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      msg: "error in getemibyid",
      error,
    });
  }
};
const deleteemi = async (req, res) => {
  try {
    const today = new Date();
    const withdrawRecords = await Emi.find({ status: "withdraw" }).select(
      "maturityDate"
    );

    if (withdrawRecords.length > 0) {
      const modifiedDates = withdrawRecords.map((record) => {
        const modifiedDate = new Date(record.maturityDate);
        modifiedDate.setDate(modifiedDate.getDate() + 15);
        return modifiedDate;
      });

      const todayDateString = today.toDateString();

      // Find records to delete
      const recordsToDelete = withdrawRecords.filter((record, index) => {
        return modifiedDates[index].toDateString() === todayDateString;
      });

      // Extract ids of records to delete
      const idsToDelete = recordsToDelete.map((record) => record._id);

      // Delete records
      const result = await Emi.deleteMany({ _id: { $in: idsToDelete } });
    }
  } catch (error) {
    console.log(error);
  }
};

const cancelEmi = async (req, res) => {
  try {
    const updateEmi = await Emi.findByIdAndUpdate(
      req.params.id,
      {
        status: "Cancelled",
      },
      { new: true, useFindAndModify: false }
    );
    res.status(200).send({
      success:true,
      msg:"cancelled emi successfully",
      results:updateEmi
    })
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      msg: "error in cancel-emi",
      error,
    });
  }
};
const deleteEmiTransaction = async(req,res)=>{
    try {
      const emiId = req.params.emiId;
      const transactionId = req.params.transactionId;
      const emi = await Emi.findById(emiId);
      const deletedTransaction = emi.transactions.find(
        (transaction) => transaction._id == transactionId
      );
  
      if (!deletedTransaction) {
        return res.status(404).json({
          success: false,
          message: "Transaction not found",
        });
      }
  
      // Update remaining amount by adding the amount of the deleted transaction
      emi.total_creditamount -= deletedTransaction.amount;
  
      // Filter out the transaction to be deleted
      emi.transactions = emi.transactions.filter(
        (transaction) => transaction._id != transactionId
      );
  
      // Save the updated order
      const updatedEmi = await emi.save();
  
      res.status(200).send({
        success: true,
        msg: "deleted emiTransaction successfully",
        results: updatedEmi,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        msg: "error in delete-emi-Transaction",
        error: error,
      });
    }
   
}
module.exports = {
  add_emitransaction,
  update_Emi,
  get_emitransaction,
  withdraw,
  recent_withdraw,
  maturityEmi,
  getEmiById,
  deleteemi,
  cancelEmi,
  deleteEmiTransaction
  
};
