const express = require("express");

const app = express();

const { adminAuth, userAuth } = require("./middlewares/auth");

app.use("/admin", [adminAuth]);

app.get("/admin/getAllUsers", (req, res) => {
  res.send("Getting all Users");
});

app.get("/admin/deleteUser", (req, res) => {
  res.send("Deleting a User");
});

app.get("/user/route1", [adminAuth, userAuth], (req, res) => {
  res.send("This is user route1");
});

app.get("/user/route2", (req, res) => {
  res.send("This is user route2");
});

app.get("/error", (req, res) => {
  throw new Error("This is error");
  //   res.send("Error route");
});

// Error Handler (Always Handel in try-catch but use this as fall back)
app.use("/", (err, req, res, next) => {
  if (err) {
    res.status(500).send("Something Went Wrong");
  }
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
