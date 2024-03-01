const express = require("express");
const app = express();
const cors  = require("cors");
const bodyparser = require("body-parser");
const dotenv = require("dotenv");
const backup = require('mongodb-backup');
const port = 8080 || process.env.PORT;
require("./Config/db")
dotenv.config();
const cron = require("node-cron");

const authroutes = require("./Routes/authroutes");
const transactionroute = require("./Routes/transaction");
const emiroutes = require("./Routes/EmiTransaction");
const loanroutes = require("./Routes/Loan");
const reportroute = require("./Routes/report");
const settingRoutes = require("./Routes/setting");
const dashboardRoutes = require("./Routes/dashboard");
const { maturityEmi,deleteemi } = require("./Controllers/emi");
const { sendemail } = require("./Controllers/transaction");
const { deleteLoan } = require("./Controllers/Loan");

//middleware
app.use(express.json());
app.use(cors());
app.use(bodyparser.urlencoded({extended:true}));

app.use("/api/auth",authroutes);
app.use("/api/transaction",transactionroute);
app.use("/api/emi",emiroutes);
app.use("/api/loan",loanroutes);
app.use("/api/report",reportroute);
app.use("/api/setting",settingRoutes);
app.use("/api/dashboard",dashboardRoutes);

cron.schedule("0 10 * * *", ()=>{
    sendemail()
    
});
cron.schedule("0 0 * * *",()=>{
    maturityEmi()
    deleteemi()
    deleteLoan()
  
    
})

app.listen(port,()=>{
    console.log(`app is live at port ${port}`);
});
