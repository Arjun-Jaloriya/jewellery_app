const moment = require("moment");
const Order = require("../Models/Order");

const typeWiseReport = async (req, res) => {
  try {
    const { year } = req.body;
    const typeData = await Order.find({
      "items.type": req.params.type,
      createdAt: {
        $gte: new Date(`${year}-01-01`),
        $lt: new Date(`${year + 1}-01-01`),
      },
    });
    if (typeData.length) {
      const totalSumAmount = typeData.map((data) => {
        return data.total_amount;
      });
      const yeartotal = totalSumAmount.reduce((sum, all) => {
        return sum + all;
      });
      
      res.status(200).send({
        success: true,
        msg: `feched type wise - ${req.params.type} report successfully`,
        count: typeData.length,
        yeartotal,
        typeData,
      });
    } else {
      return res.status(200).send({
        success: true,
        msg: "no record found",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      msg: "error in typewise-report",
      error,
    });
  }
};

const yearWiseReport = async (req, res) => {
  try {
    const yeardata = await Order.find({});
    if (yeardata.length) {
      const totalSumAmount = yeardata.map((data) => {
        return data.total_amount;
      });
      const alltotal = totalSumAmount.reduce((sum, all) => {
        return sum + all;
      });
      res.status(200).send({
        success: true,
        msg: "current year total sell",
        alltotal,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      msg: "error in yearwise-report",
      error,
    });
  }
};
module.exports = { typeWiseReport, yearWiseReport };
