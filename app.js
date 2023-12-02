const express = require("express");
const app = express();
const cors  = require("cors");
const bodyparser = require("body-parser");
const dotenv = require("dotenv");
const port = 8080 || process.env.PORT;
require("./Config/db")
dotenv.config();

const authroutes = require("./Routes/authroutes");
const transactionroute = require("./Routes/transaction");

//middleware
app.use(express.json());
app.use(cors());
app.use(bodyparser.urlencoded({extended:true}));

app.use("/api/auth",authroutes);
app.use("/api/transaction",transactionroute);

app.listen(port,()=>{
    console.log(`app is live at port ${port}`);
});
