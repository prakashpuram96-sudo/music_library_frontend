import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api",
});

API.interceptors.request.use((req) => {
  const user = localStorage.getItem("user");
  if (user) {
    req.headers.Authorization = `Bearer ${JSON.parse(user).token}`;
  }
  return req;
});

// Auth
export const registerUser = (data) => API.post("/auth/register", data);
export const registerAdmin = (data) => API.post("/auth/register-admin", data);
export const loginUser = (data) => API.post("/auth/login", data);
export const logoutUser = () => API.post("/auth/logout");

// Songs
export const getAllSongs = () => API.get("/songs");
export const getSongById = (id) => API.get(`/songs/${id}`);
export const searchSongs = (query) => API.get(`/songs/search?query=${query}`);
export const addSong = (data) => API.post("/songs", data);
export const updateSong = (id, data) => API.put(`/songs/${id}`, data);
export const deleteSong = (id) => API.delete(`/songs/${id}`);
export const toggleVisibility = (id) => API.put(`/songs/${id}/visibility`);

// Playlists
export const getMyPlaylists = () => API.get("/playlists");
export const getPlaylistById = (id) => API.get(`/playlists/${id}`);
export const createPlaylist = (data) => API.post("/playlists", data);
export const updatePlaylist = (id, data) => API.put(`/playlists/${id}`, data);
export const deletePlaylist = (id) => API.delete(`/playlists/${id}`);
export const addSongToPlaylist = (playlistId, songId) =>
  API.post(`/playlists/${playlistId}/songs/${songId}`);
export const removeSongFromPlaylist = (playlistId, songId) =>
  API.delete(`/playlists/${playlistId}/songs/${songId}`);
export const searchSongsInPlaylist = (playlistId, query) =>
  API.get(`/playlists/${playlistId}/search?query=${query}`);

// Notifications
export const getNotifications = () => API.get("/notifications");
export const markNotificationAsRead = (id) =>
  API.put(`/notifications/${id}/read`);
export const markAllNotificationsAsRead = () =>
  API.put("/notifications/read-all");
