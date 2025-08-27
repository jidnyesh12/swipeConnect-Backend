const express = require("express");
const Chat = require("../model/chat");
const { userAuth } = require("../middlewares/auth");

const chatRouter = express.Router();

chatRouter.get("/chat/:toUserId", userAuth, async (req, res) => {
  const { toUserId } = req.params;

  const userId = req.user._id;

  try {
    let chat = await Chat.findOne({
      participants: { $all: [userId, toUserId] },
    }).populate({
      path: "messages.senderId",
      select: "firstName",
    });

    if (!chat) {
      chat = new Chat({
        participants: [userId, toUserId],
        messages: [],
      });

      await chat.save();
    }

    res.json(chat);
  } catch (err) {
    res.status(500).json({
      message: "Unable to fetch chats " + err,
      data: err,
    });
  }
});

module.exports = chatRouter;
