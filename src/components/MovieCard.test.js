import { fireEvent, render, screen } from "@testing-library/react";
import MovieCard from "./MovieCard";

jest.mock("../context/MovieContext", () => ({
  useMovieContext: () => ({
    isFavorite: () => false,
    addToFavorites: jest.fn(),
    removeFromFavorites: jest.fn(),
  }),
}));

const movie = {
  id: 1,
  title: "Arrival",
  overview: "A linguist works to communicate with visitors from space.",
  poster_path: "/poster.jpg",
  backdrop_path: "/backdrop.jpg",
  release_date: "2016-11-11",
  genre_ids: [18, 878],
  vote_average: 7.6,
  original_language: "en",
};

test("opens movie details from the card and closes them with Escape", () => {
  render(<MovieCard movie={movie} />);

  fireEvent.click(screen.getByRole("button", { name: "View details for Arrival" }));

  expect(screen.getByRole("dialog", { name: "Arrival" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Play trailer" })).toBeInTheDocument();
  expect(screen.getByText(movie.overview)).toBeInTheDocument();
  expect(screen.getByText("Drama, Science Fiction")).toBeInTheDocument();

  fireEvent.keyDown(document, { key: "Escape" });

  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

test("shows series details for a TV title", () => {
  const series = {
    ...movie,
    title: "Moving",
    media_type: "tv",
    release_date: "2023-08-09",
  };
  render(<MovieCard movie={series} />);

  fireEvent.click(screen.getByRole("button", { name: "View details for Moving" }));

  expect(screen.getByText("SERIES DETAILS")).toBeInTheDocument();
  expect(screen.getByText("First air date")).toBeInTheDocument();
});
