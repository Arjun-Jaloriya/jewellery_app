const moment = require("moment");
const Order = require("../Models/Order");
const nodemailer = require("nodemailer");
const envFile =
  process.env.NODE_ENV === "development" ? ".env.development" : ".env";

// Load environment variables from the appropriate .env file
require("dotenv").config({ path: envFile });
const add_transaction = async (req, res) => {
  try {
    let {
      customerName,
      customerMobile,
      address,
      date,
      remark,
      items,
      replacement,
      isFullPayment,
      taxRate,
      taxAmount,
      subTotal,
      total_amount,
      advance_payment,
      dueDate,
      discount_amount,
      transactions, // Remove transactions from here
      paymentType,
      status,
      dispatch,
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
      case !date:
        return res.send({ error: "date is required" });
    }

    const generateOrderNumber = async () => {
      // Find the last order in the database
      const lastOrder = await Order.findOne().sort({ createdAt: -1 });

      // Extract the order number and increment it
      let nextOrderNumber;
      if (lastOrder && lastOrder.orderNo) {
        const lastOrderNumber = parseInt(
          lastOrder.orderNo.replace("ORD", ""),
          10
        );
        const nextOrderNumberInt = lastOrderNumber + 1;
        nextOrderNumber =
          "ORD" + nextOrderNumberInt.toString().padStart(2, "0");
      } else {
        // If no orders exist yet, start with ORD01
        nextOrderNumber = "ORD01";
      }

      return nextOrderNumber;
    };
    const orderNo = await generateOrderNumber();
    // Define remainingAmount and status based on isFullPayment
    let remainingAmount;
    if (isFullPayment == true) {
      if (total_amount === 0) {
        status = "price_not_fixed";
        remainingAmount = 0;
        transactions = [];

        replacement = replacement; // Empty transactions array
      } else {
        status = "Completed";
        remainingAmount = 0;

        replacement = replacement;
        transactions = [];
      }
    } else {
      // Calculate remainingAmount and set status to "Pending"
      if (replacement && replacement.length > 0) {
        const replacementTotalPriceSum = replacement.reduce(
          (sum, repl) => sum + (repl.total_Price || 0),
          0
        );

        if (total_amount === 0) {
          status = "price_not_fixed";
          remainingAmount = 0;
        } else {
          remainingAmount =
            total_amount - (replacementTotalPriceSum + advance_payment);
          transactions = [
            {
              amount: replacementTotalPriceSum + advance_payment,
              remark: remark,
            },
          ];
        }
      } else {
        if (advance_payment > 0) {
          if (total_amount === 0) {
            remainingAmount = 0;
          } else {
            transactions = [
              {
                amount: advance_payment,
                remark: remark,
              },
            ];
            remainingAmount = total_amount - advance_payment;
          }
        }
      }
      if (total_amount === 0) {
        status = "price_not_fixed";
      } else {
        status = "Pending";
      }
    }

    let filterType = "";

    if (items && items.length > 0) {
      // Extract all unique types from the items array
      const allTypes = items.reduce((types, item) => {
        if (item.type) {
          types.add(item.type);
        }
        return types;
      }, new Set());

      // Convert set of types to comma-separated string
      filterType = Array.from(allTypes).join(", ");
    } else {
      // If items array is empty or not provided, set filterType to "other"
      filterType = "other";
    }

    // Create Order document
    const adddata = new Order({
      customerName,
      customerMobile,
      address,
      date,
      remark,
      items,
      isFullPayment,
      dispatch,
      total_amount,
      taxRate,
      taxAmount,
      subTotal,
      discount_amount,
      replacement,
      advance_payment: advance_payment ? advance_payment : "",
      remainingAmount,
      dueDate,
      paymentType,
      transactions,
      status,
      orderNo: orderNo,
      filterType: filterType,
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

    if (lastOrder.status == "price_not_fixed") {
      const updatedata = await Order.findByIdAndUpdate(
        req.params.id,
        {
          $push: { transactions: transactions },
        },
        { new: true, useFindAndModify: false }
      );
      return res.status(200).send({
        success: true,
        msg: "successfully updated transaction",
        results: updatedata,
      });
    }

    if (transactions[0].amount <= lastOrder.remainingAmount) {
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
            status: "Completed",
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
    } else {
      return res.status(200).send({
        success: false,
        msg: "please enter amount less than remainingAmount",
      });
    }
    // Calculate the updated remaining amount
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
    const dispatch = req.query.dispatch ? req.query.dispatch : false;
    const filterType = req.query.filterType
      ? req.query.filterType !== "all"
        ? req.query.filterType
        : undefined
      : undefined;
    const count = await Order.find({
      $and: [
        {
          customerName: { $regex: search, $options: "i" },
        },
        { dispatch: dispatch },
      ],
    });

    if (filterType == undefined) {
      const getOrders = await Order.find({
        $and: [
          { customerName: { $regex: search, $options: "i" } },
          { dispatch: dispatch },
        ],
      })
        .skip((page - 1) * perpage)
        .limit(perpage)
        .sort({ date: -1 });
      res.status(200).send({
        success: true,
        msg: "search data fetched",
        count: count.length,
        results: getOrders,
      });
    } else {
      const getOrders = await Order.find({
        $and: [
          { customerName: { $regex: search, $options: "i" } },
          { dispatch: dispatch },
          filterType
            ? { filterType: { $regex: filterType, $options: "i" } }
            : {},
        ],
      })
        .skip((page - 1) * perpage)
        .limit(perpage)
        .sort({ date: -1 });
      res.status(200).send({
        success: true,
        msg: "search data fetched",
        count: getOrders.length,
        results: getOrders,
      });
    }
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
          status: "Pending",
        },
      ],
    })
      .skip((page - 1) * perpage)
      .limit(perpage)
      .sort({ date: -1 });

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
        status: "Cancelled",
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

    if (amount <= oldRemainingamount) {
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
        success: false,
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

const sendemail = async (req, res) => {
  try {
    const today = new Date();

    const arrayFind = await Order.aggregate([
      {
        $match: {
          status: "Pending",
          transactions: { $exists: true, $ne: [] }, // Ensure "transactions" array exists and is not empty
        },
      },
      {
        $project: {
          name: "$customerName",
          amount: "$remainingAmount",
          phone: "$customerMobile",
          lastTransactionDate: { $arrayElemAt: ["$transactions.date", -1] }, // Extract date from the last transaction object
        },
      },
      {
        $match: {
          $expr: {
            $and: [
              {
                $eq: [
                  { $dayOfMonth: "$lastTransactionDate" },
                  { $dayOfMonth: today },
                ],
              },
            ],
          },
        },
      },
    ]);
  
    if (arrayFind.length > 0) {
      const getRemainData = arrayFind.map((data) => {
        return {
          name: data.name,
          amount: data.amount,
          phone: data.phone,
        };
      });
      // console.log(getRemainData);

      // Construct the HTML content for the email body with a table
      const emailBody = `
      <html>
      <head>
          <style>
              table {
                  font-family: Arial, sans-serif;
                  border-collapse: collapse;
                  width: 100%;
              }
              th, td {
                  border: 1px solid #dddddd;
                  text-align: left;
                  padding: 8px;
              }
              th {
                  background-color: #f2f2f2;
              }
          </style>
      </head>
      <body>
          <h2>Pending Transaction Customers - ${today.toDateString()}</h2>
          <table>
              <thead>
                  <tr>
                      <th>Name</th>
                      <th>Amount</th>
                      <th>Phone</th>
                  </tr>
              </thead>
              <tbody>
                  ${getRemainData
                    .map(
                      (item) => `
                      <tr>
                          <td>${item.name}</td>
                          <td>${item.amount}</td>
                          <td>${item.phone}</td>
                      </tr>
                  `
                    )
                    .join("")}
              </tbody>
          </table>
      </body>
      </html>
    `;

      const tranporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.SENDEMAIL,
          pass: process.env.SENDPASSWORD,
        },
      });

      const mailOption = {
        from: process.env.SENDEMAIL,
        to: process.env.TOEMAIL.split(","),
        subject: `Date - ${moment().format(
          "DD-MM-YYYY"
        )} Pending Transaction Customers`,
        html: emailBody, // Set HTML content
      };

      tranporter.sendMail(mailOption, (error, info) => {});
    }
  } catch (error) {
    console.log(error);
  }
};

const edittransaction = async (req, res) => {
  try {
    let {
      customerName,
      customerMobile,
      address,
      remark,
      items,
      dispatch,
      replacement,
      isFullPayment,
      taxRate,
      taxAmount,
      subTotal,
      total_amount,
      advance_payment,
      dueDate,
      discount_amount,
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
    }
    const lastOrder = await Order.findById(req.params.id);
    let remainingAmount;
    let totalTransactionsAmount = 0,
      replacementTotalPriceSum = 0,
      totalCalculateRemaining = 0,
      transactionArray = lastOrder.transactions || [];

    advance_payment =
      advance_payment && advance_payment > 0 ? advance_payment : 0;
    if (total_amount > 0) {
      if (isFullPayment == true) {
        status = "Completed";
        remainingAmount = 0;
      } else {
        if (replacement && replacement.length > 0) {
          replacementTotalPriceSum = replacement.reduce(
            (sum, repl) => sum + (repl.total_Price || 0),
            0
          );
        }
        if (
          lastOrder.status == "price_not_fixed" &&
          lastOrder.remainingAmount == 0
        ) {
          totalTransactionsAmount = lastOrder.transactions.reduce(
            (total, transaction) => {
              return total + (transaction.amount || 0);
            },
            0
          );
        }

        totalCalculateRemaining =
          advance_payment + totalTransactionsAmount + replacementTotalPriceSum;

        remainingAmount = total_amount - totalCalculateRemaining;
        transactionArray.push({
          amount: replacementTotalPriceSum + advance_payment,
          date: new Date(),
          remark: remark,
        });

        status = "Pending";
      }
    }
    const updateOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          ...req.body,
          items,
          replacement,
          isFullPayment,
          taxRate,
          taxAmount,
          subTotal,
          total_amount,
          advance_payment,
          dueDate,
          discount_amount,
          transactions: transactionArray,
          paymentType,
          status,
          remainingAmount,
        },
      },
      { new: true, useFindAndModify: false }
    );
    res.status(200).send({
      success: true,
      msg: "updated successfully",
      results: updateOrder,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      msg: "error in editTransaction",
      error: error,
    });
  }
};
const deleteTransaction = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const transactionId = req.params.transactionId;
    const order = await Order.findById(orderId);
    const deletedTransaction = order.transactions.find(
      (transaction) => transaction._id == transactionId
    );

    if (!deletedTransaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Update remaining amount by adding the amount of the deleted transaction
    order.remainingAmount += deletedTransaction.amount;

    // Filter out the transaction to be deleted
    order.transactions = order.transactions.filter(
      (transaction) => transaction._id != transactionId
    );

    // Save the updated order
    const updatedOrder = await order.save();

    res.status(200).send({
      success: true,
      msg: "deleted successfully",
      results: updatedOrder,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      msg: "error in deleteTransaction",
      error: error,
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
  sendemail,
  edittransaction,
  deleteTransaction,
};
