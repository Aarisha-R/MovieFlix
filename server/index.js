require("dotenv").config();

const fs = require("fs");
const path = require("path");

const requiredVariables = ["DATABASE_URL", "JWT_SECRET"];
const missingVariables = requiredVariables.filter((name) => !process.env[name]);
if (missingVariables.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVariables.join(", ")}`);
}
if (process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters long.");
}

const app = require("./app");
const { initializeDatabase, pool } = require("./db");
const port = Number(process.env.API_PORT || process.env.PORT) || 5000;

async function startServer() {
  await initializeDatabase();
  await pool.query("SELECT 1");

  const server = app.listen(port, () => {
    console.log(`MovieFlix API listening on http://localhost:${port}`);
  });

  const shutdown = () => {
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

startServer().catch(async (error) => {
  console.error("Could not start the MovieFlix API.", error);
  await pool.end();
  process.exitCode = 1;
});
