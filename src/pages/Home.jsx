import { useEffect, useState } from "react";
import MovieCard from "../components/MovieCard";
import { searchMovies, getHomeSections } from "../services/Api";
import { useMovieContext } from "../context/MovieContext";
import "../css/Home.css";

function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState(null);
  const [searching, setSearching] = useState(false);
  const [sections, setSections] = useState([]);
  const [sectionsError, setSectionsError] = useState(null);
  const [sectionsLoading, setSectionsLoading] = useState(true);
  const { addToFavorites, isFavorite, removeFromFavorites } = useMovieContext();

  useEffect(() => {
    let cancelled = false;

    getHomeSections()
      .then((results) => {
        if (!cancelled) setSections(results);
      })
      .catch((error) => {
        if (!cancelled) setSectionsError(error.message);
      })
      .finally(() => {
        if (!cancelled) setSectionsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearch = async (event) => {
    event.preventDefault();
    const query = searchTerm.trim();
    if (!query) {
      setSearchError("Enter a movie or series title to search.");
      return;
    }

    setActiveSearch(query);
    setSearchResults([]);
    setSearchError(null);
    setSearching(true);
    try {
      setSearchResults(await searchMovies(query));
    } catch (error) {
      setSearchError(error.message || "Failed to search movies and series.");
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setActiveSearch("");
    setSearchResults([]);
    setSearchError(null);
  };

  const blockbusterSection = sections.find((section) => section.id === "blockbuster-movies");
  const featuredMovie = !activeSearch ? blockbusterSection?.items[0] : null;
  const featuredMediaType = featuredMovie?.media_type || "movie";

  const toggleFeaturedFavorite = () => {
    if (isFavorite(featuredMovie.id, featuredMediaType)) {
      removeFromFavorites(featuredMovie.id, featuredMediaType);
    } else {
      addToFavorites(featuredMovie);
    }
  };

  return (
    <div className="home">
      {!activeSearch && featuredMovie && (
        <section
          className="featured"
          style={{
            backgroundImage: featuredMovie.backdrop_path
              ? `url(https://image.tmdb.org/t/p/original${featuredMovie.backdrop_path})`
              : undefined,
          }}
          aria-label="Featured movie"
        >
          <div className="featured-content">
            <p className="eyebrow">FEATURED MOVIE</p>
            <h1>{featuredMovie.title}</h1>
            <p className="featured-description">
              {featuredMovie.overview || "Discover your next favorite movie."}
            </p>
            <div className="featured-actions">
              <a className="button button-primary" href="#popular">
                <span aria-hidden="true">▶</span> Explore movies
              </a>
              <button className="button button-secondary" onClick={toggleFeaturedFavorite}>
                <span aria-hidden="true">
                  {isFavorite(featuredMovie.id, featuredMediaType) ? "✓" : "+"}
                </span>
                {isFavorite(featuredMovie.id, featuredMediaType) ? "In My List" : "My List"}
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="catalog" id="popular">
        <div className="catalog-heading">
          <div>
            <p className="eyebrow">{activeSearch ? "YOUR SEARCH" : "HAND-PICKED FOR YOU"}</p>
            <h2>{activeSearch ? `Results for “${activeSearch}”` : "Explore by category"}</h2>
          </div>
          {activeSearch && (
            <button type="button" className="text-button" onClick={clearSearch}>
              Back to categories
            </button>
          )}
        </div>

        <form onSubmit={handleSearch} className="search-form" role="search">
          <label className="sr-only" htmlFor="movie-search">Search movies and series</label>
          <input
            id="movie-search"
            type="search"
            placeholder="Search movies and series"
            className="search-input"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <button type="submit" className="search-button" disabled={searching}>
            {searching ? "Searching…" : "Search"}
          </button>
        </form>

        {activeSearch ? (
          <>
            {searchError && <p className="error-message" role="alert">{searchError}</p>}
            {searching ? (
              <p className="loading" role="status">Searching movies and series…</p>
            ) : searchResults.length > 0 ? (
              <div className="movie-grid search-results">
                {searchResults.map((title) => (
                  <MovieCard movie={title} key={`${title.media_type}-${title.id}`} />
                ))}
              </div>
            ) : !searchError ? (
              <div className="empty-results">
                <h3>No titles found</h3>
                <p>Try another title or browse the categories.</p>
                <button type="button" className="text-button" onClick={clearSearch}>
                  Browse categories
                </button>
              </div>
            ) : null}
          </>
        ) : sectionsLoading ? (
          <p className="loading" role="status">Loading movies and series…</p>
        ) : sectionsError ? (
          <p className="error-message" role="alert">{sectionsError}</p>
        ) : (
          <div className="movie-shelves">
            {sections.map((section) => (
              <section className="movie-shelf" key={section.id} aria-labelledby={`${section.id}-title`}>
                <div className="movie-shelf-heading">
                  <div>
                    <p className="eyebrow">{section.mediaType === "tv" ? "SERIES" : "MOVIES"}</p>
                    <h2 id={`${section.id}-title`}>{section.title}</h2>
                  </div>
                </div>
                {section.error ? (
                  <p className="error-message" role="alert">{section.error}</p>
                ) : section.items.length > 0 ? (
                  <div className="movie-shelf-track">
                    {section.items.map((title) => (
                      <MovieCard
                        movie={title}
                        key={`${title.media_type}-${title.id}`}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="loading">No titles are available in this category.</p>
                )}
              </section>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
