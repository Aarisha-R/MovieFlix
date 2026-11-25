import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { accountApi } from '../services/AccountApi';
import { useProfileContext } from './ProfileContext';

const MovieContext = createContext();

export const useMovieContext = () => useContext(MovieContext);

function getMediaType(movie) {
  return movie.media_type === 'tv' ? 'tv' : 'movie';
}

export const MovieProvider = ({ children }) => {
  const { activeProfile } = useProfileContext();
  const [favorites, setFavorites] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);

  // Reload favorites whenever the active profile changes.
  const loadFavorites = useCallback(async (profile) => {
    if (!profile) {
      setFavorites([]);
      return;
    }
    setFavoritesLoading(true);
    try {
      const { favorites: data } = await accountApi.getFavorites(profile.id);
      setFavorites(data);
    } catch (error) {
      console.error('Could not load favorites.', error);
      setFavorites([]);
    } finally {
      setFavoritesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFavorites(activeProfile);
  }, [activeProfile, loadFavorites]);

  const addToFavorites = async (movie) => {
    if (!activeProfile) return;
    const mediaType = getMediaType(movie);
    // Optimistic update
    setFavorites((prev) => (
      prev.some((item) => item.id === movie.id && getMediaType(item) === mediaType)
        ? prev
        : [movie, ...prev]
    ));
    try {
      await accountApi.addFavorite(activeProfile.id, movie);
    } catch (error) {
      console.error('Could not add favorite.', error);
      // Roll back optimistic update
      setFavorites((prev) => prev.filter(
        (item) => item.id !== movie.id || getMediaType(item) !== mediaType
      ));
    }
  };

  const removeFromFavorites = async (movieId, mediaType = 'movie') => {
    if (!activeProfile) return;
    // Optimistic update
    setFavorites((prev) => prev.filter(
      (movie) => movie.id !== movieId || getMediaType(movie) !== mediaType
    ));
    try {
      await accountApi.removeFavorite(activeProfile.id, movieId, mediaType);
    } catch (error) {
      console.error('Could not remove favorite.', error);
      // Reload from server to restore accurate state
      loadFavorites(activeProfile);
    }
  };

  const isFavorite = (movieId, mediaType = 'movie') => favorites.some(
    (movie) => movie.id === movieId && getMediaType(movie) === mediaType
  );

  const value = {
    favorites,
    favoritesLoading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
  };

  return (
    <MovieContext.Provider value={value}>
      {children}
    </MovieContext.Provider>
  );
};