const express = require("express");

const app = express();

// Inroute we can add regex pattern too make routes
app.get(/^\/ab+c$/, (req, res) => {
  res.send("Just trying regex in route");
});

// query params
app.get("/users", (req, res) => {
  console.log(req.query);
  res.send({ Name: "Jidnyesh", email: "jidnyesh0149@gmail.com" });
});
// dymanic apis
app.get("/user/:userId", (req, res) => {
  console.log(req.params);
  res.send({ Name: "Jidnyesh", email: "jidnyesh0149@gmail.com" });
});

// get
app.get("/user", (req, res) => {
  res.send({ Name: "Jidnyesh", email: "jidnyesh0149@gmail.com" });
});

// post
app.post("/user", (req, res) => {
  res.send("Post request");
});

//delete
app.delete("/user", (req, res) => {
  res.send("Deleted user");
});

// Use will match all types of request and all.
app.use("/hello", (req, res) => {
  res.send("<h1>This is H1 in at /hello</h1>");
});

// /user
app.get("/user", async (req, res) => {
  const userEmail = req.body.email;

  try {
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      res.status(404).send("User Not Found");
    } else {
      res.send(user);
    }
  } catch (err) {
    res.status(500).send("Somethin went wrong");
  }
});

// /feed
app.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});
    if (users.length <= 0) {
      res.status(404).send("No users found");
    } else {
      res.send(users);
    }
  } catch (err) {
    res.status(500).send("Somethin went wrong");
  }
});

app.delete("/user", async (req, res) => {
  const userID = req.body.userID;
  try {
    const user = await User.findByIdAndDelete(userID);
    if (!user) {
      res.status(404).send("User Not found");
    } else {
      res.send("User Deleted successfully");
    }
  } catch (err) {
    res.status(500).send("User Not Found");
  }
});

app.patch("/user/:userID", async (req, res) => {
  const user = req.body;
  const userID = req.params?.userID;

  try {
    const ALLOWED_UPDATES = [
      "skills",
      "gender",
      "age",
      "photourl",
      "about",
      "skills",
    ];

    const isAllowed = Object.keys(user).every((k) =>
      ALLOWED_UPDATES.includes(k)
    );

    if (!isAllowed) {
      throw new Error("Error uodating user");
    }

    const myuser = await User.findByIdAndUpdate(userID, user, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!myuser) {
      res.status(404).send("User Not Found");
    } else {
      res.send("User Updated successufully");
    }
  } catch (err) {
    res.status(500).send("Something went wrong" + err);
  }
});

// app.use("/", (req, res) => {
//   res.send("Hello From Server");
// });

// app.listen(3000, () => {
//   console.log("App started at 3000");
// });
