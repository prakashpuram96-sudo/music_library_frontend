import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyPlaylists,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
} from "../services/api";

const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const { data } = await getMyPlaylists();
      setPlaylists(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newPlaylistName.trim()) {
      setError("Playlist name cannot be empty");
      return;
    }
    try {
      const { data } = await createPlaylist({ name: newPlaylistName });
      setPlaylists([...playlists, data]);
      setNewPlaylistName("");
      setShowCreate(false);
      setError("");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create playlist");
    }
  };

  const handleUpdate = async (id) => {
    if (!editingName.trim()) return;
    try {
      const { data } = await updatePlaylist(id, { name: editingName });
      setPlaylists(playlists.map((p) => (p._id === id ? data : p)));
      setEditingId(null);
      setEditingName("");
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this playlist?")) return;
    try {
      await deletePlaylist(id);
      setPlaylists(playlists.filter((p) => p._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div
        className="fade-up"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "2rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "Syne, sans-serif",
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: "800",
              letterSpacing: "-0.03em",
              marginBottom: "0.4rem",
            }}
          >
            My Playlists
          </h2>
          <p className="text-secondary">
            Manage your personal music collections
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowCreate(!showCreate)}
        >
          {showCreate ? "✕ Cancel" : "+ New Playlist"}
        </button>
      </div>

      {/* Create Playlist Form */}
      {showCreate && (
        <div
          className="glass fade-up"
          style={{ padding: "1.5rem", marginBottom: "2rem" }}
        >
          <h3
            style={{
              fontFamily: "Syne, sans-serif",
              fontSize: "1.1rem",
              fontWeight: "700",
              marginBottom: "1rem",
            }}
          >
            Create New Playlist
          </h3>
          {error && (
            <div
              style={{
                background: "rgba(244,63,142,0.15)",
                border: "1px solid rgba(244,63,142,0.3)",
                borderRadius: "10px",
                padding: "0.75rem",
                marginBottom: "1rem",
                color: "#f43f8e",
                fontSize: "0.85rem",
              }}
            >
              {error}
            </div>
          )}
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <input
              className="glass-input"
              type="text"
              placeholder="Enter playlist name..."
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              style={{ flex: 1, minWidth: "200px" }}
            />
            <button className="btn-primary" onClick={handleCreate}>
              Create
            </button>
          </div>
        </div>
      )}

      {/* Playlists List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px" }}>
          <p className="text-secondary">Loading playlists...</p>
        </div>
      ) : playlists.length === 0 ? (
        <div
          className="glass"
          style={{ textAlign: "center", padding: "4rem 2rem" }}
        >
          <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎵</p>
          <p
            style={{
              fontFamily: "Syne, sans-serif",
              fontSize: "1.2rem",
              fontWeight: "700",
              marginBottom: "0.5rem",
            }}
          >
            No playlists yet
          </p>
          <p className="text-secondary" style={{ marginBottom: "1.5rem" }}>
            Create your first playlist to get started
          </p>
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            + Create Playlist
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {playlists.map((playlist, i) => (
            <div
              key={playlist._id}
              className="glass fade-up"
              style={{
                padding: "1.2rem 1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                flexWrap: "wrap",
                animationDelay: `${i * 0.05}s`,
                cursor: "pointer",
              }}
              onClick={() => navigate(`/playlists/${playlist._id}`)}
            >
              {/* Playlist Icon */}
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "12px",
                  background:
                    "linear-gradient(135deg, rgba(108,61,211,0.6), rgba(14,165,233,0.5))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.4rem",
                  flexShrink: 0,
                }}
              >
                🎵
              </div>

              {/* Playlist Info */}
              <div style={{ flex: 1, minWidth: "120px" }}>
                {editingId === playlist._id ? (
                  <input
                    className="glass-input"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleUpdate(playlist._id)
                    }
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                    style={{ padding: "0.4rem 0.8rem", fontSize: "0.9rem" }}
                  />
                ) : (
                  <h3
                    style={{
                      fontSize: "1rem",
                      fontWeight: "600",
                      marginBottom: "0.2rem",
                    }}
                  >
                    {playlist.name}
                  </h3>
                )}
                <p className="text-secondary" style={{ fontSize: "0.8rem" }}>
                  {playlist.songs.length}{" "}
                  {playlist.songs.length === 1 ? "song" : "songs"}
                </p>
              </div>

              {/* Actions */}
              <div
                style={{ display: "flex", gap: "0.5rem" }}
                onClick={(e) => e.stopPropagation()}
              >
                {editingId === playlist._id ? (
                  <>
                    <button
                      className="btn-primary"
                      style={{ padding: "0.4rem 1rem", fontSize: "0.82rem" }}
                      onClick={() => handleUpdate(playlist._id)}
                    >
                      Save
                    </button>
                    <button
                      className="btn-secondary"
                      style={{ padding: "0.4rem 1rem", fontSize: "0.82rem" }}
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn-secondary"
                      style={{ padding: "0.4rem 1rem", fontSize: "0.82rem" }}
                      onClick={() => {
                        setEditingId(playlist._id);
                        setEditingName(playlist.name);
                      }}
                    >
                      ✏️ Rename
                    </button>
                    <button
                      className="btn-danger"
                      style={{ padding: "0.4rem 1rem", fontSize: "0.82rem" }}
                      onClick={() => handleDelete(playlist._id)}
                    >
                      🗑 Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Playlists;
