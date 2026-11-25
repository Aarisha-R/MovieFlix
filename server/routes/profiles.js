const express = require("express");
const { requireAuth } = require("../auth");
const { pool } = require("../db");

const router = express.Router();
const allowedAvatars = new Set(["coral", "violet", "teal", "amber", "blue"]);

router.use(requireAuth);

router.get("/", async (request, response) => {
  const result = await pool.query(
    "SELECT id, name, avatar FROM profiles WHERE user_id = $1 ORDER BY created_at, id",
    [request.user.id]
  );
  response.json({ profiles: result.rows });
});

router.post("/", async (request, response) => {
  const body = request.body || {};
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const avatar = body.avatar;

  if (!name || name.length > 24 || /[\u0000-\u001f\u007f]/.test(name)) {
    return response.status(400).json({ error: "Profile name must be 1 to 24 characters." });
  }
  if (!allowedAvatars.has(avatar)) {
    return response.status(400).json({ error: "Choose a valid profile color." });
  }

  const result = await pool.query(
    "INSERT INTO profiles (user_id, name, avatar) VALUES ($1, $2, $3) RETURNING id, name, avatar",
    [request.user.id, name, avatar]
  );
  response.status(201).json({ profile: result.rows[0] });
});

module.exports = router;
