const API_KEY = "20cff1acadee421848cf827bb0447025";
const BASE_URL = "https://api.themoviedb.org/3";

async function fetchResults(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set("api_key", API_KEY);
  url.searchParams.set("language", "en-US");
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Movie service request failed (${response.status}).`);
  }

  const data = await response.json();
  if (!Array.isArray(data.results)) {
    throw new Error("Movie service returned an invalid response.");
  }
  return data.results;
}

function normalizeTitle(title, mediaType) {
  return {
    ...title,
    media_type: mediaType,
    title: mediaType === "tv" ? title.name : title.title,
    release_date: mediaType === "tv" ? title.first_air_date : title.release_date,
  };
}

const sections = [
  {
    id: "blockbuster-movies",
    title: "Blockbuster Movies",
    mediaType: "movie",
    path: "/movie/popular",
  },
  {
    id: "k-dramas",
    title: "K-Dramas",
    mediaType: "tv",
    path: "/discover/tv",
    params: { with_original_language: "ko", with_genres: "18", sort_by: "popularity.desc" },
  },
  {
    id: "c-dramas",
    title: "C-Dramas",
    mediaType: "tv",
    path: "/discover/tv",
    params: { with_original_language: "zh", with_genres: "18", sort_by: "popularity.desc" },
  },
  {
    id: "crowd-pleasers",
    title: "Crowd Pleasers",
    mediaType: "movie",
    path: "/discover/movie",
    params: {
      with_genres: "12|16|35|10751",
      "vote_count.gte": "100",
      sort_by: "popularity.desc",
    },
  },
  {
    id: "violent-movies",
    title: "Violent Movies",
    mediaType: "movie",
    path: "/discover/movie",
    params: { with_genres: "28|80|53", sort_by: "popularity.desc" },
  },
  {
    id: "action-movies",
    title: "Get in on the Action",
    mediaType: "movie",
    path: "/discover/movie",
    params: { with_genres: "28", sort_by: "popularity.desc" },
  },
  {
    id: "us-tv-shows",
    title: "US TV Shows",
    mediaType: "tv",
    path: "/discover/tv",
    params: {
      with_origin_country: "US",
      with_original_language: "en",
      sort_by: "popularity.desc",
    },
  },
  {
    id: "crime-tv-shows",
    title: "Crime TV Shows",
    mediaType: "tv",
    path: "/discover/tv",
    params: { with_genres: "80", sort_by: "popularity.desc" },
  },
  {
    id: "emotional-tv-shows",
    title: "Emotional TV Shows",
    mediaType: "tv",
    path: "/discover/tv",
    params: { with_genres: "18", sort_by: "popularity.desc" },
  },
  {
    id: "chilly-thrillers",
    title: "Chilly Thrillers",
    mediaType: "movie",
    path: "/discover/movie",
    params: { with_genres: "53|27", sort_by: "popularity.desc" },
  },
  {
    id: "bollywood-movies",
    title: "Bollywood Movies",
    mediaType: "movie",
    path: "/discover/movie",
    params: {
      with_original_language: "hi",
      with_origin_country: "IN",
      sort_by: "popularity.desc",
    },
  },
  {
    id: "south-indian-cinema",
    title: "South Indian Cinema",
    mediaType: "movie",
    languages: ["ta", "te", "ml", "kn"],
  },
];

let homeSectionsPromise;

export const getPopularMovies = async (page = 1) => {
  const results = await fetchResults("/movie/popular", { page });
  return results.map((title) => normalizeTitle(title, "movie"));
};

export const getHomeSections = () => {
  if (!homeSectionsPromise) {
    homeSectionsPromise = Promise.all(
      sections.map(async (section) => {
        try {
          let results;
          if (section.languages) {
            const languageResults = await Promise.all(
              section.languages.map((language) => fetchResults("/discover/movie", {
                with_original_language: language,
                with_origin_country: "IN",
                sort_by: "popularity.desc",
              }))
            );
            results = languageResults
              .flat()
              .sort((left, right) => (right.popularity || 0) - (left.popularity || 0))
              .filter((title, index, titles) => titles.findIndex((item) => item.id === title.id) === index)
              .slice(0, 20);
          } else {
            results = await fetchResults(section.path, section.params);
          }

          return {
            id: section.id,
            title: section.title,
            mediaType: section.mediaType,
            items: results.map((title) => normalizeTitle(title, section.mediaType)),
            error: null,
          };
        } catch (error) {
          return {
            id: section.id,
            title: section.title,
            mediaType: section.mediaType,
            items: [],
            error: error.message,
          };
        }
      })
    );
  }
  return homeSectionsPromise;
};

export const searchMovies = async (query, page = 1) => {
  const results = await fetchResults("/search/multi", {
    query,
    page,
    include_adult: "false",
  });

  return results
    .filter((title) => title.media_type === "movie" || title.media_type === "tv")
    .map((title) => normalizeTitle(title, title.media_type));
};

export const getTitleTrailer = async (titleId, mediaType = "movie") => {
  if (!Number.isInteger(Number(titleId)) || Number(titleId) <= 0) {
    throw new Error("A valid title ID is required to load its trailer.");
  }
  if (mediaType !== "movie" && mediaType !== "tv") {
    throw new Error("Trailer media type must be movie or tv.");
  }

  const videos = await fetchResults(`/${mediaType}/${titleId}/videos`);
  const youtubeVideos = videos.filter((video) => video.site === "YouTube" && video.key);
  return youtubeVideos.find((video) => video.type === "Trailer" && video.official)
    || youtubeVideos.find((video) => video.type === "Trailer")
    || youtubeVideos.find((video) => video.type === "Teaser")
    || null;
};
