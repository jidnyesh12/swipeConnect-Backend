const socket = require("socket.io");
const crypto = require("crypto");
const socketAuth = require("../middlewares/socketAuth");
const Chat = require("../model/chat");
const connectionRequest = require("../model/connectionRequest");

const generateRoomKey = (userId, toUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, toUserId].sort().join("_"))
    .digest("hex");
};

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  socketAuth(io);

  io.on("connection", (socket) => {
    socket.on("joinChat", ({ firstName, userId, toUserId }) => {
      const roomId = generateRoomKey(socket.user._id, toUserId);
      socket.join(roomId);
    });

    // socket.on("broadcast", ({data})=>{
    //   socket.emit("boardcasttoallclient", {data});
    // })

    socket.on("sendMessage", async ({ userId, toUserId, data, time }) => {
      try {
        const areFriends = await connectionRequest.findOne({
          $and: [
            {
              $or: [
                { fromUserId: socket.user._id, toUserId: toUserId },
                { fromUserId: toUserId, toUserId: socket.user._id },
              ],
            },
            { status: "accepted" },
          ],
        });

        if (!areFriends) {
          return socket.emit("errorMessage", {
            msg: "You are not connected to this user",
          });
        }

        const roomId = generateRoomKey(socket.user._id, toUserId);

        let chat = await Chat.findOne({
          participants: { $all: [socket.user._id, toUserId] },
        });

        if (!chat) {
          chat = new Chat({
            participants: [socket.user._id, toUserId],
            messages: [],
          });
        }

        chat.messages.push({
          senderId: socket.user._id,
          text: data,
          time,
        });

        await chat.save();

        io.to(roomId).emit("textReceived", {
          userId: socket.user._id,
          data,
          time,
        });
      } catch (err) {
        console.log("Error saving chats to DB: " + err);
      }
    });
    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;
