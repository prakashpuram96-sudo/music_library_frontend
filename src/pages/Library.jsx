import { useState, useEffect, useRef } from "react";
import { usePlayer } from "../context/PlayerContext";
import {
  getAllSongs,
  searchSongs,
  getMyPlaylists,
  addSongToPlaylist,
} from "../services/api";

const Library = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { currentSong, isPlaying, playSong } = usePlayer();
  const [playlists, setPlaylists] = useState([]);
  const [addToPlaylistSong, setAddToPlaylistSong] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    fetchSongs();
    fetchPlaylists();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSongs = async () => {
    try {
      const { data } = await getAllSongs();
      setSongs(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaylists = async () => {
    try {
      const { data } = await getMyPlaylists();
      setPlaylists(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddToPlaylist = async (playlistId) => {
    try {
      await addSongToPlaylist(playlistId, addToPlaylistSong._id);
      const { data } = await getMyPlaylists();
      setPlaylists(data);
    } catch (error) {
      console.error(error);
    }
  };

  const isSongInPlaylist = (playlist) => {
    return playlist.songs.some((s) => s._id === addToPlaylistSong?._id);
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim() === "") {
      fetchSongs();
      return;
    }
    try {
      const { data } = await searchSongs(query);
      setSongs(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="fade-up" style={{ marginBottom: "2rem" }}>
        <h2
          style={{
            fontFamily: "Syne, sans-serif",
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            fontWeight: "800",
            letterSpacing: "-0.03em",
            marginBottom: "0.4rem",
          }}
        >
          Music Library
        </h2>
        <p className="text-secondary">Discover and play your favourite songs</p>
      </div>

      {/* Search */}
      <div
        className="fade-up"
        style={{ maxWidth: "500px", marginBottom: "2rem" }}
      >
        <div className="search-bar">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search by title, singer, album, music director..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Songs Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px" }}>
          <p className="text-secondary">Loading songs...</p>
        </div>
      ) : songs.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px" }}>
          <p style={{ fontSize: "3rem" }}>🎵</p>
          <p className="text-secondary" style={{ marginTop: "1rem" }}>
            No songs found
          </p>
        </div>
      ) : (
        <div className="songs-grid">
          {songs.map((song, i) => (
            <div
              key={song._id}
              className="song-card fade-up"
              style={{ animationDelay: `${i * 0.05}s` }}
              onClick={() => playSong(song, songs)}
            >
              {/* Cover + Dots + Overlay */}
              <div style={{ position: "relative", marginBottom: "0.9rem" }}>
                <img
                  src={song.coverImage}
                  alt={song.title}
                  style={{
                    width: "100%",
                    height: "160px",
                    objectFit: "cover",
                    borderRadius: "12px",
                  }}
                />

                {/* Play Overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "12px",
                    background: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: currentSong?._id === song._id ? 1 : 0,
                    transition: "opacity 0.3s ease",
                  }}
                >
                  <span style={{ fontSize: "2.5rem" }}>
                    {currentSong?._id === song._id && isPlaying ? "⏸" : "▶"}
                  </span>
                </div>

                {/* 3 Dots Button */}
                <div
                  ref={openMenuId === song._id ? menuRef : null}
                  style={{
                    position: "absolute",
                    top: "0.5rem",
                    right: "0.5rem",
                    zIndex: 10,
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === song._id ? null : song._id);
                    }}
                    style={{
                      background: "rgba(0,0,0,0.6)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: "50%",
                      color: "#fff",
                      width: "30px",
                      height: "30px",
                      cursor: "pointer",
                      fontSize: "1rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    ⋮
                  </button>

                  {/* Dropdown */}
                  {openMenuId === song._id && (
                    <div
                      style={{
                        position: "absolute",
                        top: "36px",
                        right: 0,
                        background: "rgba(15,8,32,0.95)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        borderRadius: "12px",
                        padding: "0.4rem",
                        minWidth: "160px",
                        backdropFilter: "blur(20px)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                        zIndex: 20,
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setAddToPlaylistSong(song);
                          setOpenMenuId(null);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.6rem",
                          width: "100%",
                          padding: "0.6rem 0.8rem",
                          background: "transparent",
                          border: "none",
                          color: "#fff",
                          cursor: "pointer",
                          fontSize: "0.85rem",
                          borderRadius: "8px",
                          transition: "background 0.2s",
                          textAlign: "left",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "rgba(255,255,255,0.08)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        <span>🎵</span> Add to Playlist
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <h3
                style={{
                  fontSize: "0.95rem",
                  fontWeight: "600",
                  marginBottom: "0.3rem",
                }}
              >
                {song.title}
              </h3>
              <p
                className="text-secondary"
                style={{ fontSize: "0.82rem", marginBottom: "0.2rem" }}
              >
                {song.singer}
              </p>
              <p
                className="text-secondary"
                style={{ fontSize: "0.78rem", marginBottom: "0.8rem" }}
              >
                {song.album}
              </p>

              {/* Play Button */}
              <button
                className="btn-primary"
                style={{ width: "100%", padding: "0.5rem" }}
                onClick={(e) => {
                  e.stopPropagation();
                  playSong(song, songs);
                }}
              >
                {currentSong?._id === song._id && isPlaying
                  ? "⏸ Pause"
                  : "▶ Play"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add to Playlist Modal */}
      {addToPlaylistSong && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="glass fade-up"
            style={{ padding: "1.8rem", maxWidth: "400px", width: "90%" }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "1.2rem",
              }}
            >
              <img
                src={addToPlaylistSong.coverImage}
                alt={addToPlaylistSong.title}
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "8px",
                  objectFit: "cover",
                }}
              />
              <div>
                <h3
                  style={{
                    fontFamily: "Syne, sans-serif",
                    fontSize: "1rem",
                    fontWeight: "700",
                  }}
                >
                  Add to Playlist
                </h3>
                <p className="text-secondary" style={{ fontSize: "0.78rem" }}>
                  {addToPlaylistSong.title} — {addToPlaylistSong.singer}
                </p>
              </div>
            </div>

            {/* Playlists */}
            {playlists.length === 0 ? (
              <div style={{ textAlign: "center", padding: "1.5rem" }}>
                <p className="text-secondary" style={{ fontSize: "0.88rem" }}>
                  No playlists yet. Create one first!
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  marginBottom: "1.2rem",
                }}
              >
                {playlists.map((playlist) => (
                  <div
                    key={playlist._id}
                    onClick={() =>
                      !isSongInPlaylist(playlist) &&
                      handleAddToPlaylist(playlist._id)
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.75rem 1rem",
                      borderRadius: "10px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      cursor: isSongInPlaylist(playlist)
                        ? "default"
                        : "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                      }}
                    >
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "8px",
                          background:
                            "linear-gradient(135deg, rgba(108,61,211,0.6), rgba(14,165,233,0.5))",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1rem",
                        }}
                      >
                        🎵
                      </div>
                      <div>
                        <p style={{ fontSize: "0.88rem", fontWeight: "600" }}>
                          {playlist.name}
                        </p>
                        <p
                          className="text-secondary"
                          style={{ fontSize: "0.75rem" }}
                        >
                          {playlist.songs.length} songs
                        </p>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        padding: "0.25rem 0.7rem",
                        borderRadius: "50px",
                        background: isSongInPlaylist(playlist)
                          ? "rgba(16,185,129,0.2)"
                          : "rgba(108,61,211,0.2)",
                        border: `1px solid ${
                          isSongInPlaylist(playlist)
                            ? "rgba(16,185,129,0.4)"
                            : "rgba(108,61,211,0.4)"
                        }`,
                        color: isSongInPlaylist(playlist)
                          ? "#10b981"
                          : "#a78bfa",
                      }}
                    >
                      {isSongInPlaylist(playlist) ? "✓ Added" : "+ Add"}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Close */}
            <button
              className="btn-secondary"
              style={{ width: "100%", padding: "0.7rem" }}
              onClick={() => setAddToPlaylistSong(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <style>{`
        .song-card:hover > div:first-child > div:nth-child(2) {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
};

export default Library;
