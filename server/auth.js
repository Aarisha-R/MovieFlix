const jwt = require("jsonwebtoken");

const COOKIE_NAME = "movieflix_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };
}

function setSessionCookie(response, user) {
  const token = jwt.sign(
    { email: user.email },
    process.env.JWT_SECRET,
    { subject: String(user.id), expiresIn: "7d" }
  );
  response.cookie(COOKIE_NAME, token, {
    ...cookieOptions(),
    maxAge: SESSION_DURATION_MS,
  });
}

function clearSessionCookie(response) {
  response.clearCookie(COOKIE_NAME, cookieOptions());
}

function requireAuth(request, response, next) {
  const token = request.cookies[COOKIE_NAME];
  if (!token) {
    return response.status(401).json({ error: "Please sign in to continue." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (typeof payload.sub !== "string" || typeof payload.email !== "string") {
      return response.status(401).json({ error: "Your session is invalid. Please sign in again." });
    }

    request.user = { id: payload.sub, email: payload.email };
    return next();
  } catch {
    return response.status(401).json({ error: "Your session has expired. Please sign in again." });
  }
}

module.exports = { clearSessionCookie, requireAuth, setSessionCookie };
