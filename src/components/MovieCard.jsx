import { useCallback, useState } from "react";
import { useMovieContext } from "../context/MovieContext";
import MovieDetailsModal from "./MovieDetailsModal";
import "../css/MovieCard.css";

function MovieCard({ movie }) {
  const { isFavorite, addToFavorites, removeFromFavorites } = useMovieContext();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const mediaType = movie.media_type === "tv" ? "tv" : "movie";
  const favorite = isFavorite(movie.id, mediaType);

  function onFavoriteClick() {
    if (favorite) {
      removeFromFavorites(movie.id, mediaType);
    } else {
      addToFavorites(movie);
    }
  }

  const closeDetails = useCallback(() => setDetailsOpen(false), []);
  const year = movie.release_date?.split("-")[0];

  return (
    <>
      <article className="movie-card">
        <button
          type="button"
          className="movie-card-open"
          onClick={() => setDetailsOpen(true)}
          aria-label={`View details for ${movie.title}`}
        >
          <div className="movie-poster">
            {movie.poster_path ? (
              <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt="" loading="lazy" />
            ) : (
              <div className="poster-placeholder">{movie.title}</div>
            )}
          </div>
          <div className="movie-info">
            <h3>{movie.title}</h3>
            <p>{year || "Release date unavailable"}</p>
          </div>
        </button>
        <button
          type="button"
          className={`favorite-btn ${favorite ? "active" : ""}`}
          onClick={onFavoriteClick}
          aria-label={favorite ? `Remove ${movie.title} from My List` : `Add ${movie.title} to My List`}
          aria-pressed={favorite}
        >
          {favorite ? "✓" : "+"}
        </button>
      </article>
      {detailsOpen && (
        <MovieDetailsModal
          movie={movie}
          mediaType={mediaType}
          favorite={favorite}
          onFavoriteClick={onFavoriteClick}
          onClose={closeDetails}
        />
      )}
    </>
  );
}

export default MovieCard;
