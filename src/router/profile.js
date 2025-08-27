const express = require("express");
const bcrypt = require("bcrypt");

const profileRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
const User = require("../model/user");
const { validateEditRequest } = require("../utils/validator");

profileRouter.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: "ERROR: " + err.message });
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const body = req.body;

    if (!validateEditRequest(req)) {
      return res.status(400).send("Invalid edit request");
    }

    const updatedUser = await User.findOneAndUpdate(user._id, body, {
      new: true,
      runValidators: true,
    });

    res.json({
      message: `${user.firstName}, your data is uppdated successfully`,
      body: updatedUser,
    });
  } catch (err) {
    console.log("ERROR updating user: " + err.message);
    res.status(400).json({
      message: "Failed to updated profile",
    });
  }
});

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const { password } = req.body;

    const newHashedPassword = await bcrypt.hash(password, 10);
    const isSame = await bcrypt.compare(password, user.password);

    if (isSame) {
      throw new Error("New password cant be same as old");
    }

    user.password = newHashedPassword;

    await user.save();

    res.json({
      message: "Password Updated succussfully",
    });
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});

module.exports = profileRouter;
