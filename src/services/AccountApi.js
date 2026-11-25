const API_BASE_URL = process.env.REACT_APP_API_URL || "";

async function request(path, { body, ...options } = {}) {
  const response = await fetch(`${API_BASE_URL}/api${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : null;
  if (!response.ok) {
    const error = new Error(data?.error || `Request failed with status ${response.status}.`);
    error.status = response.status;
    throw error;
  }
  return data;
}

export const accountApi = {
  getSession: () => request("/auth/me"),
  register: (email, password) => request("/auth/register", {
    method: "POST",
    body: { email, password },
  }),
  login: (email, password) => request("/auth/login", {
    method: "POST",
    body: { email, password },
  }),
  logout: () => request("/auth/logout", { method: "POST" }),
  getProfiles: () => request("/profiles"),
  createProfile: (name, avatar) => request("/profiles", {
    method: "POST",
    body: { name, avatar },
  }),

  // Favorites — scoped to a specific profile
  getFavorites: (profileId) => request("/favorites", {
    headers: { "x-profile-id": String(profileId) },
  }),
  addFavorite: (profileId, movie) => request("/favorites", {
    method: "POST",
    headers: { "x-profile-id": String(profileId) },
    body: movie,
  }),
  removeFavorite: (profileId, movieId, mediaType = "movie") => request(
    `/favorites/${movieId}?media_type=${encodeURIComponent(mediaType)}`, {
    method: "DELETE",
    headers: { "x-profile-id": String(profileId) },
  }),
};

