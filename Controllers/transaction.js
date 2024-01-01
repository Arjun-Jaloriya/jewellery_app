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
        updatedata,
        UpdateStatus,
      });
    }

    return res.status(200).send({
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
      console.log(getOrders.length);
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
    const pendingdata = await Order.find({ status: "Payment_Pending" });
    console.log(pendingdata);
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
      cancelorder,
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

    const Updatediscount = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: "Payment_Completed",
        discount_status: "complete with discount",
        discount_amount: amount,
      },
      { new: true, useFindAndModify: false }
    );

    res.status(200).send({
      success: true,
      msg: "discount added and transaction closed",
      Updatediscount,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      msg: "error in discount",
      error,
    });
  }
};

// const perpagetransaction = async (req, res) => {
//   try {
//     const search = req.body.search ? req.body.search : undefined;
//     const perpage = req.body.perpage ? req.body.perpage : 5;
//     const page = req.body.page ? req.body.page : 1;
//     const count = await Order.find({});

//     const result = await Order.find({
//       $or: [{ customerName: { $regex: search, $options: "i" } }],
//     })
//       .skip((page - 1) * perpage)
//       .limit(perpage)
//       .sort({ createdAt: -1 });
//     if (result.length > 0) {
//       res.status(200).send({
//         success: true,
//         msg: "search data fetched",
//         count: count.length,
//         result,
//       });
//     } else {
//       return res.status(200).send({
//         success: true,
//         msg: "no records found",
//         result: [],
//       });
//     }
//   } catch (error) {
//     console.log(error);
//     return res.status(500).send({
//       success: false,
//       msg: "error in pagination",
//       error,
//     });
//   }
// };

module.exports = {
  add_transaction,
  get_transaction,
  update_transaction,
  Get_Allorders,
  pending_status,
  cancel_order,
  discount,
};
