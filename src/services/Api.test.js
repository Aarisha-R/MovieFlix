import { getHomeSections, getTitleTrailer, searchMovies } from "./Api";

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
});

test("loads all requested movie and series shelves", async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({
      results: [{ id: 1, title: "Film", name: "Series", popularity: 10 }],
    }),
  });

  const sections = await getHomeSections();

  expect(sections.map((section) => section.title)).toEqual([
    "Blockbuster Movies",
    "K-Dramas",
    "C-Dramas",
    "Crowd Pleasers",
    "Violent Movies",
    "Get in on the Action",
    "US TV Shows",
    "Crime TV Shows",
    "Emotional TV Shows",
    "Chilly Thrillers",
    "Bollywood Movies",
    "South Indian Cinema",
  ]);
  expect(sections.find((section) => section.id === "k-dramas").items[0]).toMatchObject({
    media_type: "tv",
    title: "Series",
  });
  expect(global.fetch).toHaveBeenCalledTimes(15);
});

test("searches movies and series while excluding people", async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({
      results: [
        { id: 1, media_type: "movie", title: "Film" },
        { id: 2, media_type: "tv", name: "Series" },
        { id: 3, media_type: "person", name: "Actor" },
      ],
    }),
  });

  const results = await searchMovies("example");

  expect(results.map((title) => title.title)).toEqual(["Film", "Series"]);
  expect(results.map((title) => title.media_type)).toEqual(["movie", "tv"]);
});

test("prefers an official YouTube trailer for a TV series", async () => {
  const officialTrailer = { site: "YouTube", type: "Trailer", official: true, key: "trailer-key" };
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({
      results: [
        { site: "Vimeo", type: "Trailer", official: true, key: "other-site" },
        { site: "YouTube", type: "Teaser", official: true, key: "teaser-key" },
        officialTrailer,
      ],
    }),
  });

  await expect(getTitleTrailer(42, "tv")).resolves.toEqual(officialTrailer);
  expect(global.fetch.mock.calls[0][0]).toContain("/tv/42/videos");
});
