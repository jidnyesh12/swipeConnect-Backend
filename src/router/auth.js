const { signUpValidator } = require("../utils/validator");
const bcrypt = require("bcrypt");
const express = require("express");
const User = require("../model/user");
const sendEmail = require("../utils/mailer");
const jwt = require("jsonwebtoken");

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  try {
    // Validate
    signUpValidator(req);

    // Encrypt
    const { firstName, lastName, email, password } = req.body;

    const hashPassword = await bcrypt.hash(password, 10);

    // create instance of user model
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashPassword,
    });

    // save to DB

    const savedUser = await user.save();

    const token = await savedUser.getJWT();

    await sendEmail(email, "Welcome to DevTinder 🎉", "registration", {
      name: firstName,
      verificationLink: `http://localhost:5173/verify/${token}`,
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,         // must be true since Netlify is HTTPS
      sameSite: "None"      // required for cross-site cookies
    });

    res.json({ message: "User Added succssufully", data: savedUser });
  } catch (err) {
    res.status(500).send("Something went wrong: " + err.message);
  }
});

// /login
authRouter.post("/login", async (req, res) => {
  try {
    const { emailID, password } = req.body;

    const user = await User.findOne({ email: emailID });

    if (!user) {
      throw new Error("Invalid credentials");
    }
    const isValid = await user.validatePassword(password);
    if (isValid) {
      const token = await user.getJWT();

      res.cookie("token", token, {
      httpOnly: true,
      secure: true,         // must be true since Netlify is HTTPS
      sameSite: "None"      // required for cross-site cookies
    });
      res.send(user);
    } else {
      res.status(400).send("Invalid credentials");
    }
  } catch (err) {
    res.status(500).send("ERROR: " + err.message);
  }
});

authRouter.post("/logout", (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.send("Logged out successfully");
});

authRouter.post("/verify/:token", async (req, res) => {
  const { token } = req.params;
  if (!token) {
    return res.status(400).json({
      message: "Token Not Found",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ _id: decoded._id });

    if (!user) {
      res.status(400).json({
        message: "User Not Found",
      });
    }

    if (user.verified) {
      res.json({
        message: "User Already verified",
      });
    }

    user.verified = true;
    await user.save();
    res.json({
      message: "User Verified Successfully",
      data: user,
    });
  } catch (err) {
    console.log("Verification error " + err);
    res.status(500).json({
      message: "Fat gaya",
      data: err,
    });
  }
});

module.exports = authRouter;


