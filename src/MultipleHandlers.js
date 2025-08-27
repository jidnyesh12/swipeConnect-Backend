const express = require("express");

const app = express();

const handler3 = (req, res) => {
  console.log("This is route handeler 3");
  res.send("Response 3");
};

app.get("/user", [
  (req, res, next) => {
    console.log("This is route handeler 1");
    next();
    //   res.send("Response 1");
  },
  (req, res, next) => {
    console.log("This is route handeler 2");
    next();
    // res.send("Response 2");
  },
  handler3,
]);

// app.listen(3000, () => {
//   console.log("Listening in port 3000");
// });
