const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 25,
    },
    lastName: {
      type: String,
      minLength: 3,
      maxLength: 25,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Not a valid Email");
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Enter strong password");
        }
      },
    },
    gender: {
      type: String,
      validate(value) {
        if (!["male", "female", "other"].includes(value)) {
          throw new Error("Not a valid gender");
        }
      },
    },
    age: {
      type: Number,
      min: 18,
    },
    photourl: {
      type: String,
      default: "https://geographyandyou.com/images/user-profile.png",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Enter The valid URL");
        }
      },
    },
    verified: {
      type: Boolean,
      default: false,
    },
    about: {
      type: String,
      default: "Hey there i am using devTinder",
    },
    skills: {
      type: [String],
    },
    isPremium: {
      type: Boolean,
      required: true,
      default: false,
    },
    planType: {
      type: String,
      default: "basic",
    },
    planExpiry: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.getJWT = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  return token;
};

userSchema.methods.validatePassword = async function (pass) {
  const user = this;

  const isPasswordValid = await bcrypt.compare(pass, user.password);

  return isPasswordValid;
};

const User = model("User", userSchema);

module.exports = User;
