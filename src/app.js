const dotenv = require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
require("./cron/connectionRequestCleanup");
require("./cron/sendConnectionRequestRemainder");

const app = express();
const connectDB = require("./config/database");

const authRouter = require("./router/auth");
const profileRouter = require("./router/profile");
const requestRouter = require("./router/request");
const userRouter = require("./router/user");
const chatRouter = require("./router/chat");
const paymentRouter = require("./router/payment");

const initializeSocket = require("./utils/socket");

const server = http.createServer(app);
initializeSocket(server);

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", chatRouter);
app.use("/", paymentRouter);
app.use("/payment/webhook", express.raw({ type: "*/*" }));

app.use("/", (req, res) => {
  res.send("Hello From server");
});

connectDB()
  .then(() => {
    console.log("Database conneted successfully");
    server.listen(process.env.PORT || 3000, () => {
      console.log("listening on  " + process.env.PORT);
    });
  })
  .catch((err) => {
    console.log(err);
  });
