const express = require("express");

const requestRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const connectionRequest = require("../model/connectionRequest");

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const user = req.user;
      const status = req.params.status;
      const fromUserId = user._id;
      const toUserId = req.params.toUserId;
      const ALLOWED_STATUS = ["interested", "ignored"];

      if (!ALLOWED_STATUS.includes(status)) {
        return res.status(400).json({
          message: "Invalid request status",
        });
      }

      const isValidRequest = await connectionRequest.findOne({
        $or: [
          { toUserId: toUserId, fromUserId: fromUserId },
          { toUserId: fromUserId, fromUserId: toUserId },
        ],
      });

      if (isValidRequest) {
        return res.status(400).json({
          message: "Can not send request",
        });
      }

      const requestBody = new connectionRequest({
        toUserId,
        fromUserId,
        status,
      });

      const newRequest = await requestBody.save();

      res.json({
        message: "Request Forwarded",
        data: newRequest,
      });
    } catch (err) {
      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const user = req.user;
      const { status, requestId } = req.params;
      const ALLOWED_STATUS = ["accepted", "rejected"];

      const isAllowed = ALLOWED_STATUS.includes(status);
      if (!isAllowed) {
        res.status(400).json({ message: "Invalid Status" });
      }

      const myconnectionRequest = await connectionRequest.findOne({
        _id: requestId,
        toUserId: user._id,
        status: "interested",
      });

      if (!myconnectionRequest) {
        res.status(404).json({
          message: "Connection request Not Found",
        });
      }

      myconnectionRequest.status = status;

      const data = await myconnectionRequest.save();

      res.json({ message: "request " + status + "successfully", data: data });
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ message: "Some Error occured" });
    }
  }
);

module.exports = requestRouter;
