import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getPlaylistById,
  getAllSongs,
  addSongToPlaylist,
  removeSongFromPlaylist,
  searchSongsInPlaylist,
} from "../services/api";
import { usePlayer } from "../context/PlayerContext";

const PlaylistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentSong, isPlaying, playSong } = usePlayer();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allSongs, setAllSongs] = useState([]);
  const [showAddSongs, setShowAddSongs] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    fetchPlaylist();
  }, [id]);

  const fetchPlaylist = async () => {
    try {
      const { data } = await getPlaylistById(id);
      setPlaylist(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSongs = async () => {
    try {
      const { data } = await getAllSongs();
      setAllSongs(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleShowAddSongs = () => {
    setShowAddSongs(!showAddSongs);
    if (!showAddSongs) fetchAllSongs();
  };

  const handleAddSong = async (songId) => {
    try {
      const { data } = await addSongToPlaylist(id, songId);
      setPlaylist(data);
    } catch (error) {
      console.error(error.response?.data?.message);
    }
  };

  const handleRemoveSong = async (songId) => {
    try {
      const { data } = await removeSongFromPlaylist(id, songId);
      setPlaylist(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim() === "") {
      setSearchResults([]);
      return;
    }
    try {
      const { data } = await searchSongsInPlaylist(id, query);
      setSearchResults(data);
    } catch (error) {
      console.error(error);
    }
  };

  const songsToShow = searchQuery ? searchResults : playlist?.songs || [];
  const isSongInPlaylist = (songId) =>
    playlist?.songs.some((s) => s._id === songId);

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "5rem" }}>
        <p className="text-secondary">Loading playlist...</p>
      </div>
    );

  if (!playlist)
    return (
      <div style={{ textAlign: "center", padding: "5rem" }}>
        <p className="text-secondary">Playlist not found</p>
        <button
          className="btn-primary"
          style={{ marginTop: "1rem" }}
          onClick={() => navigate("/playlists")}
        >
          Back to Playlists
        </button>
      </div>
    );

  return (
    <div className="page-container">
      {/* Header */}
      <div className="fade-up" style={{ marginBottom: "2rem" }}>
        <button
          className="btn-secondary"
          onClick={() => navigate("/playlists")}
          style={{
            marginBottom: "1.5rem",
            padding: "0.5rem 1.2rem",
            fontSize: "0.85rem",
          }}
        >
          ← Back
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          {/* Playlist Icon */}
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "16px",
              background:
                "linear-gradient(135deg, rgba(108,61,211,0.6), rgba(14,165,233,0.5))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              flexShrink: 0,
            }}
          >
            🎵
          </div>

          <div>
            <h2
              style={{
                fontFamily: "Syne, sans-serif",
                fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
                fontWeight: "800",
                letterSpacing: "-0.03em",
                marginBottom: "0.3rem",
              }}
            >
              {playlist.name}
            </h2>
            <p className="text-secondary" style={{ fontSize: "0.88rem" }}>
              {playlist.songs.length}{" "}
              {playlist.songs.length === 1 ? "song" : "songs"}
              {playlist.songs.filter((s) => !s.isVisible).length > 0 && (
                <span style={{ color: "#f43f8e", marginLeft: "0.5rem" }}>
                  · {playlist.songs.filter((s) => !s.isVisible).length}{" "}
                  unavailable
                </span>
              )}
            </p>
          </div>

          {/* Actions */}
          <div style={{ marginLeft: "auto", display: "flex", gap: "0.75rem" }}>
            {playlist.songs.filter((s) => s.isVisible).length > 0 && (
              <button
                className="btn-primary"
                onClick={() => {
                  const visibleSongs = playlist.songs.filter(
                    (s) => s.isVisible
                  );
                  if (visibleSongs.length)
                    playSong(visibleSongs[0], visibleSongs);
                }}
              >
                ▶ Play All
              </button>
            )}
            <button className="btn-secondary" onClick={handleShowAddSongs}>
              {showAddSongs ? "✕ Close" : "+ Add Songs"}
            </button>
          </div>
        </div>
      </div>

      {/* Add Songs Panel */}
      {showAddSongs && (
        <div
          className="glass fade-up"
          style={{ padding: "1.5rem", marginBottom: "2rem" }}
        >
          <h3
            style={{
              fontFamily: "Syne, sans-serif",
              fontSize: "1rem",
              fontWeight: "700",
              marginBottom: "1rem",
            }}
          >
            Add Songs to Playlist
          </h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.6rem",
              maxHeight: "300px",
              overflowY: "auto",
            }}
          >
            {allSongs.map((song) => (
              <div
                key={song._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.6rem 0.8rem",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <img
                  src={song.coverImage}
                  alt={song.title}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "6px",
                    objectFit: "cover",
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: "0.88rem",
                      fontWeight: "600",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {song.title}
                  </p>
                  <p className="text-secondary" style={{ fontSize: "0.75rem" }}>
                    {song.singer}
                  </p>
                </div>
                <button
                  onClick={() => handleAddSong(song._id)}
                  disabled={isSongInPlaylist(song._id)}
                  style={{
                    background: isSongInPlaylist(song._id)
                      ? "rgba(16,185,129,0.2)"
                      : "rgba(108,61,211,0.4)",
                    border: `1px solid ${
                      isSongInPlaylist(song._id)
                        ? "rgba(16,185,129,0.4)"
                        : "rgba(108,61,211,0.6)"
                    }`,
                    borderRadius: "50px",
                    color: "#fff",
                    padding: "0.3rem 0.8rem",
                    fontSize: "0.78rem",
                    fontWeight: "600",
                    cursor: isSongInPlaylist(song._id) ? "default" : "pointer",
                  }}
                >
                  {isSongInPlaylist(song._id) ? "✓ Added" : "+ Add"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search inside playlist */}
      {playlist.songs.length > 0 && (
        <div style={{ maxWidth: "400px", marginBottom: "1.5rem" }}>
          <div className="search-bar">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search songs in playlist..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        </div>
      )}

      {/* Songs List */}
      {playlist.songs.length === 0 ? (
        <div
          className="glass"
          style={{ textAlign: "center", padding: "4rem 2rem" }}
        >
          <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎵</p>
          <p
            style={{
              fontFamily: "Syne, sans-serif",
              fontSize: "1.1rem",
              fontWeight: "700",
              marginBottom: "0.5rem",
            }}
          >
            No songs yet
          </p>
          <p className="text-secondary" style={{ marginBottom: "1.5rem" }}>
            Add songs to start building your playlist
          </p>
          <button className="btn-primary" onClick={handleShowAddSongs}>
            + Add Songs
          </button>
        </div>
      ) : (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          {songsToShow.map((song, i) => (
            <div
              key={song._id}
              className="glass fade-up"
              style={{
                padding: "0.9rem 1.2rem",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                animationDelay: `${i * 0.05}s`,
                cursor: song.isVisible ? "pointer" : "default",
                border:
                  currentSong?._id === song._id
                    ? "1px solid rgba(108,61,211,0.6)"
                    : "1px solid var(--glass-border)",
                opacity: song.isVisible ? 1 : 0.45,
              }}
              onClick={() =>
                song.isVisible &&
                playSong(
                  song,
                  playlist.songs.filter((s) => s.isVisible)
                )
              }
            >
              {/* Index */}
              <span
                style={{
                  fontSize: "0.82rem",
                  color: "var(--text-muted)",
                  minWidth: "20px",
                  textAlign: "center",
                }}
              >
                {currentSong?._id === song._id && isPlaying ? "▶" : i + 1}
              </span>

              {/* Cover */}
              <img
                src={song.coverImage}
                alt={song.title}
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "8px",
                  objectFit: "cover",
                  flexShrink: 0,
                  filter: song.isVisible ? "none" : "grayscale(100%)",
                }}
              />

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.92rem",
                      fontWeight: "600",
                      color: !song.isVisible
                        ? "var(--text-muted)"
                        : currentSong?._id === song._id
                        ? "#a78bfa"
                        : "#fff",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {song.title}
                  </p>
                  {!song.isVisible && (
                    <span
                      style={{
                        fontSize: "0.65rem",
                        fontWeight: "700",
                        padding: "0.1rem 0.5rem",
                        borderRadius: "50px",
                        background: "rgba(244,63,142,0.15)",
                        border: "1px solid rgba(244,63,142,0.3)",
                        color: "#f43f8e",
                        flexShrink: 0,
                      }}
                    >
                      Unavailable
                    </span>
                  )}
                </div>
                <p className="text-secondary" style={{ fontSize: "0.78rem" }}>
                  {song.singer} • {song.album}
                </p>
              </div>

              {/* Remove Button */}
              <button
                className="btn-danger"
                style={{
                  padding: "0.35rem 0.8rem",
                  fontSize: "0.78rem",
                  flexShrink: 0,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveSong(song._id);
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlaylistDetail;
