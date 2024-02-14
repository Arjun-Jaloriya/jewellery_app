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
      maturityAmount
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
      TotalInterest
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

const maturityEmi = async(req,res)=>{
  try {
      const today = new Date();
       const getData = await Emi.find({});
       const matchData = today == getData.maturityDate;
      
       console.log(getData);

  } catch (error) {
    console.log(error);
  }
}
module.exports = {
  add_emitransaction,
  update_Emi,
  get_emitransaction,
  withdraw,
  recent_withdraw,
  maturityEmi
};
