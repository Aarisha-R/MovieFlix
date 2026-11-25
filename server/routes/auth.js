const bcrypt = require("bcryptjs");
const express = require("express");
const rateLimit = require("express-rate-limit");
const { pool } = require("../db");
const { clearSessionCookie, requireAuth, setSessionCookie } = require("../auth");

const router = express.Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many sign-in attempts. Try again in a few minutes." },
});
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_PROFILE = { name: "You", avatar: "coral" };

function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function validPassword(value) {
  return typeof value === "string" && value.length >= 12 && Buffer.byteLength(value, "utf8") <= 72;
}

router.post("/register", authLimiter, async (request, response) => {
  const body = request.body || {};
  const email = normalizeEmail(body.email);
  const password = body.password;

  if (!emailPattern.test(email) || email.length > 254) {
    return response.status(400).json({ error: "Enter a valid email address." });
  }
  if (!validPassword(password)) {
    return response.status(400).json({ error: "Password must be at least 12 characters and no more than 72 UTF-8 bytes." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const passwordHash = await bcrypt.hash(password, 12);
    const userResult = await client.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
      [email, passwordHash]
    );
    const user = userResult.rows[0];
    await client.query(
      "INSERT INTO profiles (user_id, name, avatar) VALUES ($1, $2, $3)",
      [user.id, DEFAULT_PROFILE.name, DEFAULT_PROFILE.avatar]
    );
    await client.query("COMMIT");

    setSessionCookie(response, user);
    return response.status(201).json({ user });
  } catch (error) {
    await client.query("ROLLBACK");
    if (error.code === "23505") {
      return response.status(409).json({ error: "An account with that email already exists." });
    }
    throw error;
  } finally {
    client.release();
  }
});

router.post("/login", authLimiter, async (request, response) => {
  const body = request.body || {};
  const email = normalizeEmail(body.email);
  const password = body.password;
  if (!email || typeof password !== "string" || Buffer.byteLength(password, "utf8") > 72) {
    return response.status(400).json({ error: "Enter your email and password." });
  }

  const result = await pool.query(
    "SELECT id, email, password_hash FROM users WHERE LOWER(email) = $1",
    [email]
  );
  const user = result.rows[0];
  const passwordMatches = user ? await bcrypt.compare(password, user.password_hash) : false;
  if (!passwordMatches) {
    return response.status(401).json({ error: "Email or password is incorrect." });
  }

  const publicUser = { id: user.id, email: user.email };
  setSessionCookie(response, publicUser);
  return response.json({ user: publicUser });
});

router.get("/me", requireAuth, (request, response) => {
  response.json({ user: request.user });
});

router.post("/logout", (request, response) => {
  clearSessionCookie(response);
  response.json({ success: true });
});

module.exports = router;
