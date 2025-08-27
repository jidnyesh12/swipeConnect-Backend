const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "swipeChat/profiles", // Folder name inside Cloudinary
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [
      {
        width: 500,
        height: 500,
        crop: "fill",
        quality: "auto:good",
      },
    ],
    public_id: (req, file) => {
      // Generate unique filename with user ID and timestamp
      return `profile_${req.user._id}_${Date.now()}`;
    },
  },
});

// File filter function to validate image types
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

module.exports = upload;
