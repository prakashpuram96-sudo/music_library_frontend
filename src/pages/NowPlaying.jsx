import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "../context/PlayerContext";

const NowPlaying = () => {
  const {
    currentSong,
    isPlaying,
    isRepeat,
    isShuffle,
    setIsRepeat,
    setIsShuffle,
    playSong,
    handleNext,
    handlePrev,
    audioRef,
  } = usePlayer();
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!isNaN(audio.duration)) setDuration(audio.duration);
    if (!isNaN(audio.currentTime)) setProgress(audio.currentTime);

    const updateProgress = () => setProgress(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", updateDuration);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", updateDuration);
    };
  }, [audioRef, currentSong]);
  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    audio.currentTime = percentage * duration;
    setProgress(percentage * duration);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!currentSong)
    return (
      <div
        className="page-container"
        style={{ textAlign: "center", paddingTop: "5rem" }}
      >
        <p style={{ fontSize: "3rem" }}>🎵</p>
        <p className="text-secondary" style={{ marginTop: "1rem" }}>
          No song is playing
        </p>
        <button
          className="btn-primary"
          style={{ marginTop: "1.5rem" }}
          onClick={() => navigate("/library")}
        >
          Go to Library
        </button>
      </div>
    );

  return (
    <div
      style={{
        position: "fixed",
        top: "60px",
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        zIndex: 1,
      }}
    >
      {/* Back Button */}
      <div style={{ position: "absolute", top: "1rem", left: "1.5rem" }}>
        <button
          className="btn-secondary"
          onClick={() => navigate(-1)}
          style={{ padding: "0.5rem 1.2rem", fontSize: "0.85rem" }}
        >
          ← Back
        </button>
      </div>

      {/* Main Card */}
      <div
        className="glass fade-up"
        style={{
          width: "100%",
          maxWidth: "520px",
          padding: "1.5rem",
          textAlign: "center",
        }}
      >
        {/* Cover Image */}
        <div style={{ marginBottom: "1rem" }}>
          <img
            src={currentSong.coverImage}
            alt={currentSong.title}
            style={{
              width: "180px",
              height: "180px",
              borderRadius: "16px",
              objectFit: "cover",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              animation: isPlaying ? "spin-slow 20s linear infinite" : "none",
            }}
          />
        </div>

        {/* Song Info */}
        <h2
          style={{
            fontFamily: "Syne, sans-serif",
            fontSize: "1.5rem",
            fontWeight: "800",
            marginBottom: "0.3rem",
          }}
        >
          {currentSong.title}
        </h2>
        <p
          className="text-secondary"
          style={{ fontSize: "0.95rem", marginBottom: "0.2rem" }}
        >
          {currentSong.singer}
        </p>
        <p
          className="text-secondary"
          style={{ fontSize: "0.8rem", marginBottom: "1.2rem" }}
        >
          {currentSong.album} • {currentSong.musicDirector}
        </p>

        {/* Progress Bar */}
        <div style={{ marginBottom: "1.2rem", padding: "0 8px" }}>
          <div
            style={{
              width: "100%",
              height: "8px",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              position: "relative",
              marginBottom: "0.4rem",
            }}
          >
            {/* Actual track with onClick */}
            <div
              onClick={handleSeek}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                height: "6px",
                background: "rgba(255,255,255,0.15)",
                borderRadius: "3px",
              }}
            >
              {/* Fill */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${duration ? (progress / duration) * 100 : 0}%`,
                  background: "linear-gradient(90deg, #6c3dd3, #0ea5e9)",
                  borderRadius: "3px",
                  transition: "width 0.1s linear",
                }}
              />
              {/* Thumb */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: `${duration ? (progress / duration) * 100 : 0}%`,
                  transform: "translate(-50%, -50%)",
                  width: "14px",
                  height: "14px",
                  borderRadius: "50%",
                  background: "#fff",
                  boxShadow: "0 0 8px rgba(108,61,211,0.8)",
                  zIndex: 2,
                  pointerEvents: "none",
                }}
              />
            </div>
          </div>

          {/* Time Labels */}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              {formatTime(progress)}
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.8rem",
            marginBottom: "1.2rem",
          }}
        >
          <button
            onClick={() => setIsShuffle(!isShuffle)}
            style={{
              background: isShuffle
                ? "rgba(108,61,211,0.4)"
                : "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "50%",
              color: "#fff",
              width: "40px",
              height: "40px",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            🔀
          </button>

          <button
            onClick={handlePrev}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "50%",
              color: "#fff",
              width: "46px",
              height: "46px",
              cursor: "pointer",
              fontSize: "1.1rem",
            }}
          >
            ⏮
          </button>

          <button
            className="btn-primary"
            onClick={() => playSong(currentSong)}
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              fontSize: "1.3rem",
              padding: 0,
            }}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>

          <button
            onClick={handleNext}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "50%",
              color: "#fff",
              width: "46px",
              height: "46px",
              cursor: "pointer",
              fontSize: "1.1rem",
            }}
          >
            ⏭
          </button>

          <button
            onClick={() => setIsRepeat(!isRepeat)}
            style={{
              background: isRepeat
                ? "rgba(108,61,211,0.4)"
                : "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "50%",
              color: "#fff",
              width: "40px",
              height: "40px",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            🔁
          </button>
        </div>

        {/* Song Meta Tags */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "0.6rem",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: "50px",
              padding: "0.25rem 0.8rem",
              fontSize: "0.75rem",
              color: "var(--text-muted)",
            }}
          >
            📅 {new Date(currentSong.releaseDate).getFullYear()}
          </span>
          <span
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: "50px",
              padding: "0.25rem 0.8rem",
              fontSize: "0.75rem",
              color: "var(--text-muted)",
            }}
          >
            🎼 {currentSong.musicDirector}
          </span>
          <span
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: "50px",
              padding: "0.25rem 0.8rem",
              fontSize: "0.75rem",
              color: "var(--text-muted)",
            }}
          >
            💿 {currentSong.album}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default NowPlaying;
