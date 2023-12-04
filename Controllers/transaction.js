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
      advance_payment,
      dueDate,
      paymentType,
      transactions,
      status,
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
      case !total_amount:
        return res.send({ error: "total_amount is required" });
      case !advance_payment:
        return res.send({ error: "advance_payment is required" });
      case !dueDate:
        return res.send({ error: "dueDate is required" });
      case !paymentType:
        return res.send({ error: "paymentType is required" });
    }

    const remainpayment = total_amount - advance_payment;

    const adddata = new Order({
      customerName,
      customerMobile,
      address,
      items,
      isFullPayment,
      total_amount,
      advance_payment,
      remainingAmount: remainpayment,
      dueDate,
      paymentType,
      transactions: [{ amount: advance_payment }],
      status,
    }).save();
    res.status(200).send({
      success: true,
      msg: "order added successfully",
    });
  } catch (error) {
    // console.log(error);
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
    // console.log(error);
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
    const lastOrder = await Order.findById(req.params.id);

    // Calculate the updated remaining amount
    const updatedRemainingAmount =
      lastOrder.remainingAmount - transactions[0].amount;

    const updatedata = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $push: { transactions: transactions },
        $set: { remainingAmount: updatedRemainingAmount },
      },
      { new: true, useFindAndModify: false }
    );
    const remainingAmount = lastOrder.remainingAmount;
    if (remainingAmount == 0) {
      const UpdateStatus = await Order.findByIdAndUpdate(req.params.id, {
        status: "Payment_Completed",
      });
    }
    res.status(200).send({
      success: true,
      msg: "successfully updated transaction",
      updatedata,
      
    });
  } catch (error) {
    // console.log(error);
    return res.status(500).send({
      success: false,
      msg: "error in update-transaction",
      error,
    });
  }
};

const Get_Allorders = async (req, res) => {
  try {
    const GetAllorders = await Order.find({});
    res.status(200).send({
      success: true,
      msg: "fetched all orders",
      GetAllorders,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      msg: "error in getallorders",
      error,
    });
  }
};
module.exports = {
  add_transaction,
  get_transaction,
  update_transaction,
  Get_Allorders,
};
