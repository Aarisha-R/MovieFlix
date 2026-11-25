const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profiles");
const favoritesRoutes = require("./routes/favorites");


const app = express();
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:3000,http://localhost:5001")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function isAllowedDevelopmentOrigin(origin) {
  if (process.env.NODE_ENV === "production") {
    return false;
  }
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
}

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || isAllowedDevelopmentOrigin(origin)) {
      return callback(null, true);
    }
    const error = new Error("This application origin is not allowed.");
    error.status = 403;
    return callback(error);
  },
  credentials: true,
}));
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

app.get("/api/health", (request, response) => {
  response.json({ status: "ok" });
});
app.use("/api/auth", authRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/favorites", favoritesRoutes);


app.use((request, response) => {
  response.status(404).json({ error: "API endpoint not found." });
});

app.use((error, request, response, next) => {
  if (response.headersSent) {
    return next(error);
  }
  console.error("API request failed.", error);
  const status = Number.isInteger(error.status) ? error.status : 500;
  const message = status >= 500 ? "The server could not complete the request." : error.message;
  return response.status(status).json({ error: message });
});

module.exports = app;
