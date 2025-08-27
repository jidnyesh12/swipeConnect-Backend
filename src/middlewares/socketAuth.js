// middleware/socketAuth.js
const cookie = require("cookie");
const jwt = require("jsonwebtoken");

const socketAuth = (io) => {
  io.use((socket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers.cookie || "");
      const token = cookies["token"]; // use your cookie name

      if (!token) return next(new Error("Authentication error"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // attach user info to socket
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });
};

module.exports = socketAuth;
