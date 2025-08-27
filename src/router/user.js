const express = require("express");

const userRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
const connectionRequest = require("../model/connectionRequest");
const User = require("../model/user");

const USER_SAFE_DATA = [
  "firstName",
  "lastName",
  "about",
  "photourl",
  "skills",
  "age",
  "gender",
];

userRouter.get("/user/request/recieved", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const data = await connectionRequest
      .find({
        toUserId: loggedInUser._id,
        status: "interested",
      })
      .populate("fromUserId", USER_SAFE_DATA);

    res.send({
      message: "data fetched successfully",
      data: data,
    });
  } catch (err) {
    console.log("Error: " + err.message);
    res.status(400).json({
      message: "Error fetching pending request",
    });
  }
});

userRouter.get("/user/request/sent", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const data = await connectionRequest.find({
      fromUserId: user._id,
      status: "interested",
    }).populate("toUserId");

    res.json({
      message: "Fetched successfully",
      data,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch sent connection request" + err,
    });
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    console.log(loggedInUser);

    const connections = await connectionRequest
      .find({
        $or: [
          { toUserId: loggedInUser._id, status: "accepted" },
          { fromUserId: loggedInUser._id, status: "accepted" },
        ],
      })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);
    const data = connections.map((row) => {
      if (row.fromUserId?._id.toString() === loggedInUser._id.toString()) {
        if (row.toUserId) return row.toUserId;
      }
      if (row.fromUserId) return row.fromUserId;
    });

    res.json({
      message: "Connections fetched successfully",
      data,
    });
  } catch (err) {
    res.status(400).json({
      message: "Error getting connections: " + err.message,
    });
  }
});

userRouter.get("/user/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await connectionRequest
      .find({
        $or: [{ toUserId: loggedInUser._id }, { fromUserId: loggedInUser._id }],
      })
      .select("fromUserId toUserId");

    const hideUserIds = new Set();

    connectionRequests.forEach((req) => {
      hideUserIds.add(req.toUserId.toString());
      hideUserIds.add(req.fromUserId.toString());
    });

    const pageNumber = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (pageNumber - 1) * limit;

    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUserIds) } },
        { _id: { $ne: loggedInUser._id } }, // Not required here but can be used in diff usecase.
      ],
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    res.json({
      data: users,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

userRouter.get("/user/:userId", userAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ _id: userId });
    if (!user) {
      res.status(404).json({
        massage: "User Not Found",
      });
    }

    res.json({
      message: "User Fetced successfully",
      data: user,
    });
  } catch (err) {
    res.json({
      message: "Something went wrong in /user/:userId",
    });
  }
});

module.exports = userRouter;
