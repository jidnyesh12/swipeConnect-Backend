const validator = require("validator");

const signUpValidator = (req) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName) {
    throw new Error("Name Not Valid");
  } else if (!validator.isEmail(email)) {
    throw new Error("Enter Valid email");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Enter strong password");
  }
};

const validateEditRequest = (req) => {
  const body = req.body;

  const ALLOWED_UPDATES = [
    "firstName",
    "lastName",
    "gender",
    "age",
    "photourl",
    "about",
    "skills",
  ];

  const isValidUpdate = Object.keys(body).every((key) =>
    ALLOWED_UPDATES.includes(key)
  );
  return isValidUpdate;
};

module.exports = {
  signUpValidator,
  validateEditRequest,
};
