const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    airtableUserId: { type: String, unique: true },
    email: String,
    name: String,
    accessToken: String,
    refreshToken: String,
    lastLoginAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
