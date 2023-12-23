const Loan = require("../Models/Loan");

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
      case !totalItemCost:
        return res.send({ error: "totalItemCost is required" });
      case !loanCost:
        return res.send({ error: "loanCost is required" });
      case !interestRate:
        return res.send({ error: "interestRate is required" });
    }

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
    const currentDate = new Date();
    const daysElapsed =
      Math.floor(
        (currentDate - olddata.lastUpdateDate + 1) / (24 * 60 * 60 * 1000)
      ) + 1;
    if (daysElapsed > 0) {
      const dailyInterest =
        (olddata.updatedLoanCost * olddata.interestRate) / 100 / 365;
      const totalInterest =
        olddata.updatedInterest + dailyInterest * daysElapsed;
      const updatedata = await Loan.findByIdAndUpdate(
        req.params.id,
        {
          totalInterest: totalInterest,
          updatedInterest: totalInterest,
          lastUpdateDate: currentDate,
        },
        { new: true, useFindAndModify: false }
      );

      res.status(200).send({
        suceess: true,
        msg: "update daily interest successfully",
        updatedata,
      });
    } else {
      res.status(200).send({
        success: true,
        message: "No update needed",
        totalInterest: olddata.totalInterest,
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
    // let tamount = transaction.amount[0];
    // Subtract deposit amount from total interest
    const updatedTotalInterest = Math.max(
      lastloandata.updatedInterest - transaction[0].amount,
      0
    );
    // console.log(updatedTotalInterest, "updated");

    // Calculate remaining deposit amount after subtracting from total interest
    const remainingDeposit =
      transaction[0].amount -
      (lastloandata.updatedInterest - updatedTotalInterest);
    // console.log(remainingDeposit, "remain");

    // Subtract remaining deposit from updated loan cost
    const updatedLoanCost = Math.max(
      lastloandata.updatedLoanCost - remainingDeposit,
      0
    );
    // console.log(updatedLoanCost, "cost");

    let updateLoanTransaction = await Loan.findByIdAndUpdate(
      req.params.id,
      {
        updatedLoanCost: updatedLoanCost,
        updatedInterest: updatedTotalInterest,
        transactions: transaction,
      },
      { new: true, useFindAndModify: false }
    );

    if (updatedLoanCost == 0) {
      let updatestatus = await Loan.findByIdAndUpdate(
        req.params.id,
        {
          status: "Loan closed",
        },
        { new: true, useFindAndModify: false }
      );
      return res.status(200).send({
        success: true,
        msg: "your Loan is closed",
        updatestatus,
        updateLoanTransaction,
      });
    }
    return res.status(200).send({
      success: true,
      msg: "successfully update loan-transaction",
      updateLoanTransaction,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      msg: "error in update-loantransaction",
    });
  }
};
module.exports = { addLoan, updateinterest, update_loantransaction };