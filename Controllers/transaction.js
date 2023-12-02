const momemt = require("moment");
const { Order } = require("../Models/Order");

const add_transaction = async (req, res) => {
  try {
    const {
      customerName,
      customerMobile,
      address,
      items,
      isFullPayment,
      total_amount,
      remainingAmount,
      dueDate,
      paymentType,
      transactions,
    } = req.body;
    switch (true) {
      case !customerName:
        return res.send({ error: "customerName is required" });
      case !customerMobile:
        return res.send({ error: "customerMobile is required" });
      case !address:
        return res.send({ error: "address is required" });
      case !items:
        return res.send({ error: "items is required" });
      case !isFullPayment:
        return res.send({ error: "isFullPayment is required" });
      case !dueDate:
        return res.send({ error: "dueDate is required" });
      case !paymentType:
        return res.send({ error: "paymentType is required" });
      case !transactions:
        return res.send({ error: "transactions is required" });
    }

    const adddata = new Order({
      customerName,
      customerMobile,
      address,
      items,
      isFullPayment,
      total_amount,
      remainingAmount,
      dueDate,
      paymentType,
      transactions,
    }).save();
    res.status(200).send({
      success: true,
      msg: "order added successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      msg: "error in add_transaction",
      error,
    });
  }
};

const get_transaction = async (req, res) => {
  try {
    const getdata = await Order.findById(req.params.id);
    res.status(200).send({
      success: true,
      msg: "fetched record successfully",
      getdata,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      msg: "error in get",
      error,
    });
  }
};

const update_transaction = async (req, res) => {
  try {
    const { transactions } = req.body;
    const updatedata = await Order.findByIdAndUpdate(
      req.params.id,
      { $push: { transactions: transactions } },
      { new: true, useFindAndModify: false }
    );

    res.status(200).send({
      success: true,
      msg: "successfully updated transaction",
      updatedata,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      msg: "error in update-transaction",
      error,
    });
  }
};
module.exports = { add_transaction, get_transaction, update_transaction };
