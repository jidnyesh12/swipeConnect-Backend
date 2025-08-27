const jwt = require("jsonwebtoken");
const User = require("../model/user");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({ message: "Please login" });
    }

    // Use jwt.verify instead of jwt.decode for security
    const decodedObj = jwt.verify(token, process.env.JWT_SECRET);

    const { _id } = decodedObj;

    const user = await User.findOne({ _id: _id });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    res.status(500).json({ message: "Authentication error: " + err.message });
  }
};

// Optional: Middleware to check if user is verified
const requireVerification = async (req, res, next) => {
  try {
    if (!req.user.verified) {
      return res.status(403).json({
        message: "Please verify your email to access this feature",
        verified: false,
      });
    }
    next();
  } catch (err) {
    res
      .status(500)
      .json({ message: "Verification check error: " + err.message });
  }
};

module.exports = {
  userAuth,
  requireVerification,
};
