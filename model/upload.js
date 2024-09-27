const mongoose = require("mongoose");

var uploadSchema = new mongoose.Schema({
  file: {
    type: String,
    // required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  uploadDate: { type: Date, default: Date.now },
});

const uploadCollection = mongoose.model("upload", uploadSchema);

uploadSchema.pre("save", function (next) {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB in bytes

  if (this.file.length > MAX_FILE_SIZE) {
    return next(new Error("Image file size exceeds the maximum limit."));
  }

  next();
});

module.exports = uploadCollection;
