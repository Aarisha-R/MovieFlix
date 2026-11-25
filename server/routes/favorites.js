const express = require("express");
const { requireAuth } = require("../auth");
const { pool } = require("../db");

const router = express.Router();

// All favorites routes require a valid session.
router.use(requireAuth);

/**
 * Resolve and validate that the given profile belongs to the authenticated user.
 * Returns the numeric profile ID, or throws with status 403.
 */
async function resolveProfile(request, response) {
  const profileId = Number(request.headers["x-profile-id"]);
  if (!Number.isInteger(profileId) || profileId <= 0) {
    response.status(400).json({ error: "A valid x-profile-id header is required." });
    return null;
  }

  const result = await pool.query(
    "SELECT id FROM profiles WHERE id = $1 AND user_id = $2",
    [profileId, request.user.id]
  );
  if (result.rowCount === 0) {
    response.status(403).json({ error: "Profile not found or does not belong to this account." });
    return null;
  }
  return profileId;
}

// GET /api/favorites — list all favorites for the active profile
router.get("/", async (request, response) => {
  const profileId = await resolveProfile(request, response);
  if (profileId === null) return;

  const result = await pool.query(
    `SELECT movie_id AS id, media_type, title, poster_path, backdrop_path, overview, release_date
     FROM favorites
     WHERE profile_id = $1
     ORDER BY created_at DESC`,
    [profileId]
  );
  response.json({ favorites: result.rows });
});

// POST /api/favorites — add a movie to the active profile's favorites
router.post("/", async (request, response) => {
  const profileId = await resolveProfile(request, response);
  if (profileId === null) return;

  const body = request.body || {};
  const movieId = Number(body.id);
  const mediaType = body.media_type === undefined ? "movie" : body.media_type;
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const posterPath = typeof body.poster_path === "string" ? body.poster_path : null;
  const backdropPath = typeof body.backdrop_path === "string" ? body.backdrop_path : null;
  const overview = typeof body.overview === "string" ? body.overview : null;
  const releaseDate = typeof body.release_date === "string" ? body.release_date : null;

  if (!Number.isInteger(movieId) || movieId <= 0) {
    return response.status(400).json({ error: "A valid movie id is required." });
  }
  if (mediaType !== "movie" && mediaType !== "tv") {
    return response.status(400).json({ error: "Media type must be movie or tv." });
  }
  if (!title) {
    return response.status(400).json({ error: "Movie title is required." });
  }

  // Upsert: ignore if already favorited (do not error on duplicate)
  const result = await pool.query(
    `INSERT INTO favorites (profile_id, movie_id, media_type, title, poster_path, backdrop_path, overview, release_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (profile_id, media_type, movie_id) DO UPDATE
       SET title = EXCLUDED.title,
           poster_path = EXCLUDED.poster_path,
           backdrop_path = EXCLUDED.backdrop_path,
           overview = EXCLUDED.overview,
           release_date = EXCLUDED.release_date
     RETURNING movie_id AS id, media_type, title, poster_path, backdrop_path, overview, release_date`,
    [profileId, movieId, mediaType, title, posterPath, backdropPath, overview, releaseDate]
  );
  response.status(201).json({ favorite: result.rows[0] });
});

// DELETE /api/favorites/:movieId — remove a movie from the active profile's favorites
router.delete("/:movieId", async (request, response) => {
  const profileId = await resolveProfile(request, response);
  if (profileId === null) return;

  const movieId = Number(request.params.movieId);
  const mediaType = request.query.media_type === undefined
    ? "movie"
    : request.query.media_type;
  if (!Number.isInteger(movieId) || movieId <= 0) {
    return response.status(400).json({ error: "A valid movie ID is required." });
  }
  if (mediaType !== "movie" && mediaType !== "tv") {
    return response.status(400).json({ error: "Media type must be movie or tv." });
  }

  const result = await pool.query(
    "DELETE FROM favorites WHERE profile_id = $1 AND movie_id = $2 AND media_type = $3",
    [profileId, movieId, mediaType]
  );
  if (result.rowCount === 0) {
    return response.status(404).json({ error: "That title is not in your list." });
  }
  response.json({ success: true });
});

module.exports = router;
