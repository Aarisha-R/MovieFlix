import '../css/Favorite.css';
import { useMovieContext } from '../context/MovieContext';
import MovieCard from '../components/MovieCard';
import { Link } from 'react-router-dom';

function Favorite(){
    const {favorites} = useMovieContext();
    if(favorites.length > 0){
        return(
        <div className='favorites'>
        <p className="eyebrow">YOUR COLLECTION</p>
        <h1>My List</h1>
         <div className="movie-grid">
        {favorites.map((movie) => (
         <MovieCard movie={movie} key={`${movie.media_type || 'movie'}-${movie.id}`} />
        ))}
        </div>
      </div>
        );
    }
    return(
    <div className="favorites-empty">
        <p className="eyebrow">YOUR COLLECTION</p>
        <h1>Your list is empty</h1>
        <p>Add movies you want to watch and they’ll show up here.</p>
        <Link className="button button-primary" to="/">Explore movies</Link>
    </div>
    )
}
export default Favorite;