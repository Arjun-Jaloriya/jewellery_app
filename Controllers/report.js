const moment = require("moment");
const Order = require("../Models/Order");
const ExcelJS = require("exceljs");
const excel = require("excel4node");
const fs = require("fs");
const path = require("path");

const typeWiseReport = async (req, res) => {
  try {
    const { year } = req.query;
    const typeData = await Order.find({
      "items.type": req.query.type,
      date: {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year + 1}-01-01`),
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
        msg: `${req.query.type} report fetched`,
        count: typeData.length,
        yearTotal: yeartotal,
        results: typeData,
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

const customReport = async (req, res) => {
  try {
    let { startDate, endDate } = req.query;
    const search = req.query.search ? req.query.search : "";
    const perpage = req.query.perpage ? req.query.perpage : 5;
    const page = req.query.page ? req.query.page : 1;

    const startDateTime = new Date(startDate);
    startDateTime.setHours(0, 0, 0, 0);

    const endDateTime = new Date(endDate);
    endDateTime.setHours(23, 59, 59, 999);

    const count = await Order.find({
      $and: [
        { date: { $gte: startDateTime, $lte: endDateTime } },
        { customerName: { $regex: search, $options: "i" } },
      ],
    });
    const reportData = await Order.find({
      $and: [
        { date: { $gte: startDateTime, $lte: endDateTime } },
        { customerName: { $regex: search, $options: "i" } },
      ],
    })
      .skip((page - 1) * perpage)
      .limit(perpage)
      .sort({ date: -1 });

    if (reportData.length) {
      const totalSumAmount = reportData.map((data) => {
        return data.total_amount;
      });
      const allTotal = totalSumAmount.reduce((sum, total_amount) => {
        return sum + total_amount;
      });
      res.status(200).send({
        success: true,
        msg: `${startDate} to ${endDate} report fetched`,
        Total: allTotal,
        count: count.length,
        results: reportData,
      });
    } else {
      res.status(200).send({
        success: true,
        msg: "data fetched",
        count: count.length,
        results: [],
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      msg: "Error in custome-Report",
      error: error,
    });
  }
};

const exportexcel = async (req, res) => {
  try {
    let { startDate, endDate } = req.query;

    const startDateTime = new Date(startDate);
    startDateTime.setHours(0, 0, 0, 0);

    const endDateTime = new Date(endDate);
    endDateTime.setHours(23, 59, 59, 999);

    const reportData = await Order.find({
      $and: [{ date: { $gte: startDateTime, $lte: endDateTime } }],
    });
    if (reportData.length > 0) {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Report");

      // Add headers with formatting
      worksheet.columns = [
        { header: "Customer Name", key: "customerName", width: 20 },
        { header: "Customer Mobile", key: "customerMobile", width: 20 },
        { header: "Address", key: "address", width: 25 },
        { header: "OrderNO", key: "orderNo", width: 15 },
        { header: "Is Full Payment", key: "isFullPayment", width: 20 },
        { header: "Payment Type", key: "paymentType", width: 15 },
        { header: "Status", key: "status", width: 25 },
        { header: "Date", key: "date", width: 25 },
        { header: "Delivery", key: "dispatch", width: 20 },
        { header: "Discount Amount", key: "discount_amount", width: 17 },
        // { header: "Discount Status", key: "discount_status", width: 25 },
        { header: "Item Quantity", key: "itemQuantity", width: 15 },
        {
          header: "Replacement Quantity",
          key: "replacementQuantity",
          width: 22,
        },
        { header: "Total Amount", key: "total_amount", width: 20 },
        { header: "Advance Payment", key: "advance_payment", width: 20 },
        { header: "Remaining Amount", key: "remainingAmount", width: 20 },
      ];

      // Add data
      reportData.forEach((data) => {
        worksheet.addRow({
          customerName: data.customerName,
          customerMobile: data.customerMobile,
          address: data.address,
          orderNo: data.orderNo,
          itemQuantity: data.items.length,
          replacementQuantity: data.replacement.length,
          isFullPayment: data.isFullPayment,
          total_amount: data.total_amount,
          advance_payment: data.advance_payment,
          remainingAmount: data.remainingAmount,
          paymentType: data.paymentType,
          status: data.status,
          date: moment(data.date).toISOString(),
          dispatch: data.dispatch,
          discount_amount: data.discount_amount,
          // discount_status: data.discount_status,
        });
      });

      // Set response headers to trigger download
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=customreport.xlsx"
      );

      // Stream the workbook to the client
      workbook.xlsx.write(res).then(() => {
        res.end();
      });
    } else {
      res.status(200).send({
        success: true,
        msg: "no record found",
        results: [],
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      msg: "error in custom-Datewise-report",
      error,
    });
  }
};

module.exports = { typeWiseReport, customReport, exportexcel };
