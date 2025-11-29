const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

router.get("/dev-token", async (req, res) => {
  try {

    const user = await User.findOne({
      accessToken: { $exists: true, $ne: null },
    });

    if (!user) {
      return res.status(500).json({
        message:
          "No user with accessToken found. Please run real Airtable login once so a user is created.",
      });
    }

    const appToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({ token: appToken });
  } catch (err) {
    console.error("Dev token error:", err.message);
    return res.status(500).json({ message: "Dev token failed" });
  }
});

module.exports = router;
