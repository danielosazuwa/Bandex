const mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  roles: {
    type: Number,
    default: 0,
  },
  refreshToken: String,
});

const collection = mongoose.model("user", userSchema);

module.exports = collection;
