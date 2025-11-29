const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");

const router = express.Router();

const pkceStore = {};

router.get("/login", (req, res) => {
  const codeVerifier = crypto.randomBytes(32).toString("base64url");

  const hash = crypto.createHash("sha256").update(codeVerifier).digest("base64");
  const codeChallenge = hash
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const state = crypto.randomBytes(16).toString("hex");
  pkceStore[state] = codeVerifier;

  const authUrl = new URL("https://airtable.com/oauth2/v1/authorize");

  authUrl.searchParams.set("client_id", process.env.AIRTABLE_CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", process.env.AIRTABLE_REDIRECT_URI);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set(
    "scope",
    "data.records:read data.records:write schema.bases:read webhook:manage"
  );
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("code_challenge", codeChallenge);
  authUrl.searchParams.set("code_challenge_method", "S256");

  console.log("Airtable Auth URL:", authUrl.toString());
  res.redirect(authUrl.toString());
});


router.get("/callback", async (req, res) => {
  const { code, state } = req.query;

  if (!code) {
    return res.status(400).send("Missing code from Airtable");
  }

  const codeVerifier = pkceStore[state];
  if (!codeVerifier) {
    return res.status(400).send("Invalid or expired state");
  }
  delete pkceStore[state];

  try {
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
    };

    if (process.env.AIRTABLE_CLIENT_SECRET) {
      const basic = Buffer.from(
        `${process.env.AIRTABLE_CLIENT_ID}:${process.env.AIRTABLE_CLIENT_SECRET}`
      ).toString("base64");
      headers.Authorization = `Basic ${basic}`;
    }

    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: process.env.AIRTABLE_CLIENT_ID,
      redirect_uri: process.env.AIRTABLE_REDIRECT_URI,
      code_verifier: codeVerifier,
    });

    const tokenRes = await axios.post(
      "https://airtable.com/oauth2/v1/token",
      params.toString(),
      { headers }
    );

    const { access_token, refresh_token } = tokenRes.data;

    const meRes = await axios.get("https://api.airtable.com/v0/meta/whoami", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const airtableUser = meRes.data;

    let user = await User.findOne({ airtableUserId: airtableUser.id });

    if (!user) {
      user = new User({
        airtableUserId: airtableUser.id,
        email: airtableUser.email,
        name: airtableUser.name,
        accessToken: access_token,
        refreshToken: refresh_token,
        lastLoginAt: new Date(),
      });
    } else {
      user.accessToken = access_token;
      user.refreshToken = refresh_token;
      user.lastLoginAt = new Date();
    }

    await user.save();

    const appToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${appToken}`;

    return res.redirect(redirectUrl);

  } catch (err) {
    if (err.response) {
      console.error("STATUS:", err.response.status);
      console.error("DATA:", err.response.data);
    } else {
      console.error("MESSAGE:", err.message);
    }
    return res
      .status(500)
      .json({
        error: "OAuth callback failed",
        details: err.response?.data || err.message,
      });
  }
});


module.exports = router;