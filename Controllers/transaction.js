const moment = require("moment");
const Order = require("../Models/Order");

const add_transaction = async (req, res) => {
  try {
    let {
      customerName,
      customerMobile,
      address,
      items,
      replacement,
      isFullPayment,
      taxRate,
      taxAmount,
      subTotal,
      total_amount,
      advance_payment,
      dueDate,
      transactions,
      paymentType,
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
      case !taxRate:
        return res.send({ error: "taxRate is required" });
      case !taxAmount:
        return res.send({ error: "taxAmount is required" });
      case !subTotal:
        return res.send({ error: "subTotal is required" });
    }

    if (isFullPayment == true) {
      status = "Payment_Completed";
      remainingAmount = 0;
    } else {
      if (replacement && replacement.length > 0) {
        // Calculate the sum of replacement.total_Price
        const replacementTotalPriceSum = replacement.reduce(
          (sum, repl) => sum + (repl.total_Price || 0),
          0
        );

        remainingAmount =
          total_amount - (replacementTotalPriceSum + advance_payment);
      } else {
        remainingAmount = total_amount - advance_payment;
      }
      status = "Payment_Pending";
    }

    const adddata = new Order({
      customerName,
      customerMobile,
      address,
      items,
      isFullPayment,
      
      total_amount,
      taxRate,
      taxAmount,
      subTotal,
      replacement,
      advance_payment: replacement
        ? replacement.reduce((sum, repl) => sum + (repl.total_Price || 0), 0) +
          advance_payment
        : advance_payment,
      remainingAmount,
      dueDate,
      paymentType,
      transactions: [
        {
          amount: replacement
            ? replacement.reduce(
                (sum, repl) => sum + (repl.total_Price || 0),
                0
              ) + advance_payment
            : advance_payment,
        },
      ],
      status,
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
      results: getdata,
    });
  } catch (error) {
    // console.log(error);
    return res.status(500).send({
      success: false,
      msg: "error in get_transaction",
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

    if (updatedRemainingAmount == 0) {
      const UpdateStatus = await Order.findByIdAndUpdate(
        req.params.id,
        {
          status: "Payment_Completed",
        },
        { new: true, useFindAndModify: false }
      );
      return res.status(200).send({
        success: true,
        msg: "successfully updated transaction and status",
        results: updatedata,
        resultStatus: UpdateStatus,
      });
    }

    return res.status(200).send({
      success: true,
      msg: "successfully updated transaction",
      results: updatedata,
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
    const search = req.query.search ? req.query.search : "";
    const perpage = req.query.perpage ? req.query.perpage : 5;
    const page = req.query.page ? req.query.page : 1;
    const count = await Order.find({
      $or: [
        {
          customerName: { $regex: search, $options: "i" },
        },
      ],
    });

    const getOrders = await Order.find({
      $or: [{ customerName: { $regex: search, $options: "i" } }],
    })
      .skip((page - 1) * perpage)
      .limit(perpage)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      msg: "search data fetched",
      count: count.length,
      results: getOrders,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      msg: "error in getallorders",
      error,
    });
  }
};

const pending_status = async (req, res) => {
  try {
    const search = req.query.search ? req.query.search : "";
    const perpage = req.query.perpage ? req.query.perpage : 5;
    const page = req.query.page ? req.query.page : 1;

    const count = await Order.find({
      $or: [
        {
          customerName: { $regex: search, $options: "i" },
        },
      ],
    });

    const pendingData = await Order.find({
      $and: [
        { customerName: { $regex: search, $options: "i" } },
        {
          status: "Payment_Pending",
        },
      ],
    })
      .skip((page - 1) * perpage)
      .limit(perpage)
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      count: pendingData.length,
      results: pendingData,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      msg: "error in getpending_status",
      error,
    });
  }
};

const cancel_order = async (req, res) => {
  try {
    const cancelorder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: "cancel_order",
      },
      { new: true, useFindAndModify: false }
    );
    res.status(200).send({
      success: true,
      msg: "order cancelled successfully",
      results: cancelorder,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      msg: "error in cancel-order",
      error,
    });
  }
};

const discount = async (req, res) => {
  try {
    let { amount } = req.body;
    const oldData = await Order.findById(req.params.id);
    const oldRemainingamount = oldData.remainingAmount;
    
    if (amount <= oldRemainingamount ) {
      const Updatediscount = await Order.findByIdAndUpdate(
        req.params.id,
        {
          status: "complete with discount",
          discount_amount: amount,
        },
        { new: true, useFindAndModify: false }
      );
      res.status(200).send({
        success: true,
        msg: "discount added and transaction closed",
        results: Updatediscount,
      });
    } else {
      return res.status(200).send({
        success: true,
        msg: "please enter amount less than remainingAmount",
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

module.exports = {
  add_transaction,
  get_transaction,
  update_transaction,
  Get_Allorders,
  pending_status,
  cancel_order,
  discount,
};
