CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(254) NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_idx
  ON users (LOWER(email));

CREATE TABLE IF NOT EXISTS profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(24) NOT NULL CHECK (CHAR_LENGTH(BTRIM(name)) BETWEEN 1 AND 24),
  avatar VARCHAR(10) NOT NULL CHECK (avatar IN ('coral', 'violet', 'teal', 'amber', 'blue')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS profiles_user_id_idx
  ON profiles (user_id);

CREATE TABLE IF NOT EXISTS favorites (
  id            BIGSERIAL PRIMARY KEY,
  profile_id    BIGINT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  movie_id      INTEGER NOT NULL,
  media_type    TEXT NOT NULL DEFAULT 'movie' CHECK (media_type IN ('movie', 'tv')),
  title         TEXT NOT NULL,
  poster_path   TEXT,
  backdrop_path TEXT,
  overview      TEXT,
  release_date  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE favorites
  ADD COLUMN IF NOT EXISTS media_type TEXT NOT NULL DEFAULT 'movie';

ALTER TABLE favorites
  DROP CONSTRAINT IF EXISTS favorites_profile_id_movie_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS favorites_profile_media_id_unique_idx
  ON favorites (profile_id, media_type, movie_id);

CREATE INDEX IF NOT EXISTS favorites_profile_id_idx
  ON favorites (profile_id);

