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

    const dailyInterest = Math.round((loanCost * interestRate) / 100 / 365);

    let adddata = await new Loan({
      customerName,
      customerMobile,
      customerAddress,
      items,
      totalItemCost,
      loanCost,
      interestRate,
      transactions,
      totalInterest: dailyInterest,
      updatedInterest: dailyInterest,
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

    const daysElapsed = Math.ceil(
      (currentDate.getDate() - olddata.lastUpdateDate.getDate()) /
        (24 * 60 * 60 * 1000)
    );
    console.log(
      currentDate.getDate(),
      olddata.lastUpdateDate.getDate(),
      daysElapsed
    );
    if (daysElapsed > 0) {
      const dailyInterest =
        (olddata.updatedLoanCost * olddata.interestRate) / 100 / 365;

      const totalInterest = Math.floor(
        olddata.updatedInterest + dailyInterest * daysElapsed
      );
      const updatedata = await Loan.findByIdAndUpdate(
        req.params.id,
        {
          totalInterest: totalInterest + olddata.totalInterest,
          updatedInterest: totalInterest,
          lastUpdateDate: currentDate,
        },
        { new: true, useFindAndModify: false }
      );

      return res.status(200).send({
        suceess: true,
        msg: "update daily interest successfully",
        results: updatedata,
      });
    } else {
      return res.status(200).send({
        success: true,
        message: "No update needed for interest",
        totalInterest: olddata.updatedInterest,
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

    // Subtract deposit amount from total interest
    const updatedTotalInterest = Math.max(
      lastloandata.updatedInterest - transaction[0].amount,
      0
    );

    // Calculate remaining deposit amount after subtracting from total interest
    const remainingDeposit =
      transaction[0].amount -
      (lastloandata.updatedInterest - updatedTotalInterest);

    // Subtract remaining deposit from updated loan cost
    const updatedLoanCost = Math.max(
      lastloandata.updatedLoanCost - remainingDeposit,
      0
    );

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
        resultStatus: updatestatus,
        results: updateLoanTransaction,
      });
    }
    return res.status(200).send({
      success: true,
      msg: "successfully update loan-transaction",
      results:updateLoanTransaction,
    });
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

module.exports = {
  addLoan,
  updateinterest,
  update_loantransaction,
  getallLoan,
};
