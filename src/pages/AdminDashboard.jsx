import { useState, useEffect } from "react";
import { Snackbar, Alert } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import {
  getAllSongs,
  addSong,
  updateSong,
  deleteSong,
  toggleVisibility,
} from "../services/api";
import useToast from "../hooks/useToast";

const SongForm = ({
  isEdit,
  formData,
  handleChange,
  handleDateChange,
  handleAdd,
  handleUpdate,
  setEditingSong,
  setShowAddForm,
  setFormData,
  setError,
  error,
  emptyForm,
}) => (
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <div
      className="glass fade-up"
      style={{ padding: "1.5rem", marginBottom: "2rem" }}
    >
      <h3
        style={{
          fontFamily: "Syne, sans-serif",
          fontSize: "1.1rem",
          fontWeight: "700",
          marginBottom: "1.2rem",
        }}
      >
        {isEdit ? "✏️ Edit Song" : "+ Add New Song"}
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

      {/* Row 1 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "0.8rem",
          marginBottom: "0.8rem",
        }}
      >
        {[
          { name: "title", placeholder: "Song title *", label: "Title" },
          { name: "singer", placeholder: "Singer name *", label: "Singer" },
          {
            name: "musicDirector",
            placeholder: "Music director *",
            label: "Music Director",
          },
          { name: "album", placeholder: "Album name", label: "Album" },
        ].map((field) => (
          <div key={field.name}>
            <label
              style={{
                fontSize: "0.72rem",
                fontWeight: "600",
                color: "var(--text-muted)",
                letterSpacing: "0.06em",
                display: "block",
                marginBottom: "0.35rem",
              }}
            >
              {field.label}
            </label>
            <input
              className="glass-input"
              name={field.name}
              placeholder={field.placeholder}
              value={formData[field.name]}
              onChange={handleChange}
            />
          </div>
        ))}
      </div>

      {/* Row 2 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "0.8rem",
          marginBottom: "1.2rem",
        }}
      >
        {/* MUI DatePicker */}
        <div>
          <label
            style={{
              fontSize: "0.72rem",
              fontWeight: "600",
              color: "var(--text-muted)",
              letterSpacing: "0.06em",
              display: "block",
              marginBottom: "0.35rem",
            }}
          >
            Release Date
          </label>
          <DatePicker
            value={formData.releaseDate ? dayjs(formData.releaseDate) : null}
            onChange={(newValue) => handleDateChange(newValue)}
            slotProps={{
              textField: {
                size: "small",
                fullWidth: true,
                sx: {
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#fff",
                    fontFamily: "DM Sans, sans-serif",
                    fontSize: "0.88rem",
                    "& fieldset": { border: "none" },
                    "&:hover": {
                      background: "rgba(255,255,255,0.10)",
                      border: "1px solid rgba(255,255,255,0.25)",
                    },
                    "&.Mui-focused": {
                      border: "1px solid rgba(108,61,211,0.6)",
                      boxShadow: "0 0 0 3px rgba(108,61,211,0.15)",
                    },
                  },
                  "& .MuiInputAdornment-root .MuiIconButton-root": {
                    color: "rgba(255,255,255,0.5)",
                  },
                  "& .MuiInputBase-input": {
                    color: "#fff",
                    "&::placeholder": { color: "rgba(255,255,255,0.3)" },
                  },
                },
              },
              popper: {
                sx: {
                  "& .MuiPaper-root": {
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "20px",
                    backdropFilter: "blur(40px)",
                    WebkitBackdropFilter: "blur(40px)",
                    boxShadow:
                      "0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
                    color: "#fff",
                  },
                  "& .MuiPickersCalendarHeader-root": { color: "#fff" },
                  "& .MuiPickersCalendarHeader-label": {
                    color: "#fff",
                    fontFamily: "Syne, sans-serif",
                    fontWeight: "700",
                    fontSize: "1rem",
                  },
                  "& .MuiIconButton-root": {
                    color: "rgba(255,255,255,0.6)",
                    "&:hover": { background: "rgba(255,255,255,0.08)" },
                  },
                  "& .MuiDayCalendar-weekDayLabel": {
                    color: "rgba(255,255,255,0.35)",
                    fontFamily: "DM Sans, sans-serif",
                    fontWeight: "600",
                  },
                  "& .MuiPickersDay-root": {
                    color: "rgba(255,255,255,0.85)",
                    background: "transparent",
                    fontFamily: "DM Sans, sans-serif",
                    borderRadius: "10px",
                    "&:hover": {
                      background: "rgba(108,61,211,0.25)",
                      color: "#fff",
                    },
                    "&.Mui-selected": {
                      background:
                        "linear-gradient(135deg, #6c3dd3 0%, #0ea5e9 100%) !important",
                      color: "#fff",
                      fontWeight: "700",
                      boxShadow: "0 4px 15px rgba(108,61,211,0.4)",
                    },
                    "&.MuiPickersDay-today:not(.Mui-selected)": {
                      border: "1px solid rgba(108,61,211,0.6)",
                      color: "#a78bfa",
                      background: "rgba(108,61,211,0.1)",
                    },
                  },
                  "& .MuiPickersDay-dayOutsideMonth": {
                    color: "rgba(255,255,255,0.15) !important",
                  },
                  "& .MuiPickersArrowSwitcher-button": {
                    color: "rgba(255,255,255,0.6)",
                  },
                  "& .MuiYearCalendar-root .MuiPickersYear-yearButton": {
                    color: "rgba(255,255,255,0.7)",
                    "&.Mui-selected": {
                      background:
                        "linear-gradient(135deg, #6c3dd3, #0ea5e9) !important",
                      color: "#fff",
                    },
                  },
                },
              },
            }}
          />
        </div>

        <div>
          <label
            style={{
              fontSize: "0.72rem",
              fontWeight: "600",
              color: "var(--text-muted)",
              letterSpacing: "0.06em",
              display: "block",
              marginBottom: "0.35rem",
            }}
          >
            Audio URL *
          </label>
          <input
            className="glass-input"
            name="url"
            placeholder="https://..."
            value={formData.url}
            onChange={handleChange}
          />
        </div>

        <div>
          <label
            style={{
              fontSize: "0.72rem",
              fontWeight: "600",
              color: "var(--text-muted)",
              letterSpacing: "0.06em",
              display: "block",
              marginBottom: "0.35rem",
            }}
          >
            Cover Image URL
          </label>
          <input
            className="glass-input"
            name="coverImage"
            placeholder="https://..."
            value={formData.coverImage}
            onChange={handleChange}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.75rem" }}>
        <button
          className="btn-primary"
          onClick={isEdit ? handleUpdate : handleAdd}
        >
          {isEdit ? "Update Song" : "Add Song"}
        </button>
        <button
          className="btn-secondary"
          onClick={() => {
            setEditingSong(null);
            setShowAddForm(false);
            setFormData(emptyForm);
            setError("");
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  </LocalizationProvider>
);

const AdminDashboard = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [error, setError] = useState("");
  const { toast, showToast, hideToast } = useToast();

  const emptyForm = {
    title: "",
    singer: "",
    musicDirector: "",
    album: "",
    releaseDate: "",
    url: "",
    coverImage: "",
  };
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    fetchSongs();
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (newValue) => {
    setFormData({
      ...formData,
      releaseDate: newValue ? newValue.format("YYYY-MM-DD") : "",
    });
  };

  const handleAdd = async () => {
    if (
      !formData.title ||
      !formData.singer ||
      !formData.musicDirector ||
      !formData.url
    ) {
      setError("Title, Singer, Music Director and URL are required");
      return;
    }
    try {
      const { data } = await addSong(formData);
      setSongs([...songs, data]);
      setFormData(emptyForm);
      setShowAddForm(false);
      setError("");
      showToast("Song added successfully!");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add song");
      showToast(error.response?.data?.message || "Failed to add song", "error");
    }
  };

  const handleEdit = (song) => {
    setEditingSong(song._id);
    setFormData({
      title: song.title,
      singer: song.singer,
      musicDirector: song.musicDirector,
      album: song.album || "",
      releaseDate: song.releaseDate?.split("T")[0] || "",
      url: song.url,
      coverImage: song.coverImage || "",
    });
    setShowAddForm(false);
  };

  const handleUpdate = async () => {
    if (
      !formData.title ||
      !formData.singer ||
      !formData.musicDirector ||
      !formData.url
    ) {
      setError("Title, Singer, Music Director and URL are required");
      return;
    }
    try {
      const { data } = await updateSong(editingSong, formData);
      setSongs(songs.map((s) => (s._id === editingSong ? data : s)));
      setEditingSong(null);
      setFormData(emptyForm);
      setError("");
      showToast("Song updated successfully!");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update song");
      showToast(
        error.response?.data?.message || "Failed to update song",
        "error"
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this song?")) return;
    try {
      await deleteSong(id);
      setSongs(songs.filter((s) => s._id !== id));
      showToast("Song deleted successfully!");
    } catch (error) {
      showToast("Failed to delete song", "error");
      console.error(error);
    }
  };

  const handleToggleVisibility = async (id) => {
    try {
      const { data } = await toggleVisibility(id);
      setSongs(songs.map((s) => (s._id === id ? data.song : s)));
      showToast(
        `"${data.song?.title ?? "Song"}" is now ${
          data.song.isVisible ? "visible" : "hidden"
        }`
      );
    } catch (error) {
      showToast("Failed to update visibility", "error");
      console.error(error);
    }
  };

  const formProps = {
    formData,
    handleChange,
    handleDateChange,
    handleAdd,
    handleUpdate,
    setEditingSong,
    setShowAddForm,
    setFormData,
    setError,
    error,
    emptyForm,
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
            Admin Dashboard
          </h2>
          <p className="text-secondary">{songs.length} songs in library</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingSong(null);
            setFormData(emptyForm);
            setError("");
          }}
        >
          {showAddForm ? "✕ Cancel" : "+ Add Song"}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && <SongForm isEdit={false} {...formProps} />}

      {/* Edit Form */}
      {editingSong && <SongForm isEdit={true} {...formProps} />}

      {/* Songs List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <p className="text-secondary">Loading songs...</p>
        </div>
      ) : (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          {songs.map((song, i) => (
            <div
              key={song._id}
              className="glass fade-up"
              style={{
                padding: "1rem 1.2rem",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                flexWrap: "wrap",
                animationDelay: `${i * 0.03}s`,
                opacity: song.isVisible ? 1 : 0.5,
              }}
            >
              <img
                src={song.coverImage}
                alt={song.title}
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "8px",
                  objectFit: "cover",
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: "140px" }}>
                <p
                  style={{
                    fontSize: "0.92rem",
                    fontWeight: "600",
                    marginBottom: "0.2rem",
                  }}
                >
                  {song.title}
                  {!song.isVisible && (
                    <span
                      style={{
                        marginLeft: "0.5rem",
                        fontSize: "0.7rem",
                        background: "rgba(244,63,142,0.2)",
                        border: "1px solid rgba(244,63,142,0.3)",
                        borderRadius: "50px",
                        padding: "0.1rem 0.5rem",
                        color: "#f43f8e",
                      }}
                    >
                      Hidden
                    </span>
                  )}
                </p>
                <p className="text-secondary" style={{ fontSize: "0.78rem" }}>
                  {song.singer} • {song.album} • {song.musicDirector}
                </p>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <button
                  onClick={() => handleToggleVisibility(song._id)}
                  style={{
                    background: song.isVisible
                      ? "rgba(16,185,129,0.15)"
                      : "rgba(244,63,142,0.15)",
                    border: `1px solid ${
                      song.isVisible
                        ? "rgba(16,185,129,0.3)"
                        : "rgba(244,63,142,0.3)"
                    }`,
                    borderRadius: "50px",
                    color: "#fff",
                    padding: "0.35rem 0.8rem",
                    fontSize: "0.78rem",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  {song.isVisible ? "👁 Hide" : "👁 Show"}
                </button>
                <button
                  className="btn-secondary"
                  style={{ padding: "0.35rem 0.8rem", fontSize: "0.78rem" }}
                  onClick={() => handleEdit(song)}
                >
                  ✏️ Edit
                </button>
                <button
                  className="btn-danger"
                  style={{ padding: "0.35rem 0.8rem", fontSize: "0.78rem" }}
                  onClick={() => handleDelete(song._id)}
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MUI Snackbar Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={hideToast}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{
          "&.MuiSnackbar-root": {
            top: "80px",
            right: "24px",
            left: "auto",
            transform: "none",
          },
        }}
      >
        <Alert
          onClose={hideToast}
          severity={toast.severity}
          variant="outlined"
          sx={{
            borderRadius: "14px",
            fontFamily: "DM Sans, sans-serif",
            fontWeight: "600",
            fontSize: "0.88rem",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            background: "rgba(6, 8, 24, 0.85)",
            border:
              toast.severity === "success"
                ? "1px solid rgba(16,185,129,0.5)"
                : "1px solid rgba(244,63,142,0.5)",
            color: "#fff",
            boxShadow:
              toast.severity === "success"
                ? "0 8px 32px rgba(16,185,129,0.15), 0 0 0 1px rgba(16,185,129,0.1)"
                : "0 8px 32px rgba(244,63,142,0.15), 0 0 0 1px rgba(244,63,142,0.1)",
            minWidth: "280px",
            "& .MuiAlert-icon": {
              color: toast.severity === "success" ? "#10b981" : "#f43f8e",
              alignItems: "center",
            },
            "& .MuiAlert-message": { color: "#fff" },
            "& .MuiAlert-action button": { color: "rgba(255,255,255,0.5)" },
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AdminDashboard;
