import { useEffect, useRef, useState } from "react";
import { getTitleTrailer } from "../services/Api";
import "../css/MovieDetailsModal.css";

const GENRES = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

function MovieDetailsModal({ movie, mediaType, favorite, onFavoriteClick, onClose }) {
  const closeButtonRef = useRef(null);
  const trailerPlayerRef = useRef(null);
  const [trailer, setTrailer] = useState(null);
  const [trailerError, setTrailerError] = useState("");
  const [trailerLoading, setTrailerLoading] = useState(false);
  const isSeries = mediaType === "tv";
  const year = movie.release_date?.split("-")[0];
  const genres = (movie.genre_ids || []).map((id) => GENRES[id]).filter(Boolean);
  const backdrop = movie.backdrop_path || movie.poster_path;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  useEffect(() => {
    if (trailer) {
      trailerPlayerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [trailer]);

  const playTrailer = async () => {
    setTrailerError("");
    setTrailerLoading(true);
    try {
      const video = await getTitleTrailer(movie.id, mediaType);
      if (!video) {
        setTrailerError("No YouTube trailer is available for this title.");
        return;
      }
      setTrailer(video);
    } catch (error) {
      setTrailerError(error.message || "Could not load this trailer.");
    } finally {
      setTrailerLoading(false);
    }
  };

  return (
    <div className="movie-modal-backdrop" onClick={onClose}>
      <section
        className="movie-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="movie-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="movie-modal-hero"
          style={{
            backgroundImage: backdrop
              ? `url(https://image.tmdb.org/t/p/original${backdrop})`
              : undefined,
          }}
        >
          <button
            ref={closeButtonRef}
            className="movie-modal-close"
            type="button"
            onClick={onClose}
            aria-label="Close movie details"
          >
            ×
          </button>
          <div className="movie-modal-hero-content">
            <p className="movie-modal-eyebrow">{isSeries ? "SERIES DETAILS" : "MOVIE DETAILS"}</p>
            <h2 id="movie-modal-title">{movie.title}</h2>
            <div className="movie-modal-actions">
              <button
                type="button"
                className="movie-modal-play-button"
                onClick={playTrailer}
                disabled={trailerLoading}
              >
                <span aria-hidden="true">▶</span>
                {trailerLoading ? "Finding trailer…" : "Play trailer"}
              </button>
              <button
                type="button"
                className={`movie-modal-list-button${favorite ? " active" : ""}`}
                onClick={onFavoriteClick}
                aria-pressed={favorite}
              >
                <span aria-hidden="true">{favorite ? "✓" : "+"}</span>
                {favorite ? "In My List" : "Add to My List"}
              </button>
            </div>
            {trailerError && <p className="movie-modal-trailer-error" role="alert">{trailerError}</p>}
          </div>
        </div>

        {trailer && (
          <div className="movie-modal-player" ref={trailerPlayerRef}>
            <div className="movie-modal-player-frame">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(trailer.key)}?autoplay=1&rel=0`}
                title={`${movie.title} trailer`}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
            <button type="button" className="movie-modal-trailer-close" onClick={() => setTrailer(null)}>
              Back to details
            </button>
          </div>
        )}

        <div className="movie-modal-content">
          <div className="movie-modal-summary">
            <div className="movie-modal-rating">
              {movie.vote_average > 0
                ? `★ ${movie.vote_average.toFixed(1)} / 10`
                : "Not rated"}
              {year && <span>{year}</span>}
            </div>
            <p className="movie-modal-overview">
              {movie.overview || "No description is available for this movie yet."}
            </p>
          </div>

          <dl className="movie-modal-metadata">
            {genres.length > 0 && (
              <div>
                <dt>Genres</dt>
                <dd>{genres.join(", ")}</dd>
              </div>
            )}
            {movie.original_language && (
              <div>
                <dt>Original language</dt>
                <dd>{movie.original_language.toUpperCase()}</dd>
              </div>
            )}
            {movie.release_date && (
              <div>
                <dt>{isSeries ? "First air date" : "Release date"}</dt>
                <dd>{movie.release_date}</dd>
              </div>
            )}
          </dl>
        </div>
      </section>
    </div>
  );
}

export default MovieDetailsModal;
