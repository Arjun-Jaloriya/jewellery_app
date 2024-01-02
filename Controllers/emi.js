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
      completation_date,
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
    let nextYear = new Date(today);
    nextYear.setFullYear(today.getFullYear() + 1);

    const add_emi = await new Emi({
      customerName,
      customerMobile,
      address,
      fixed_Emi,
      transactions,
      total_creditamount: transactions[0].amount,
      completation_date: nextYear,
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
    let lastamount = lastemi.total_creditamount;

    let updatedamount = lastamount + transactions[0].amount;

    // let sumtotal = lastamount.reduce((sum, tran) => {
    //   sum + (tran.amount || 0), 0;
    // });
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
      results:update_Totalamount,
    });
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
    let updatewithdraw = await Emi.findByIdAndUpdate(
      req.params.id,
      {
        withdraw_status: "withdraw",
      },
      {
        new: true,
        useFindAndModify: false,
      }
    );
    res.status(200).send({
      success: true,
      msg: "withdraw money successfull",
      results:updatewithdraw,
    });
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
    const { frequency } = req.body;
    const withdrawdata = await Emi.find({
      createdAt: { $gt: moment().subtract(Number(frequency), "d").toDate() },
    });
    res.status(200).send({
      success: true,
      msg: "fetched recent withdraw successfully",
     results:withdrawdata,
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

module.exports = {
  add_emitransaction,
  update_Emi,
  get_emitransaction,
  withdraw,
  recent_withdraw,
  
};
