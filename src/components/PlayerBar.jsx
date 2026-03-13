import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { usePlayer } from "../context/PlayerContext";

const PlayerBar = () => {
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
  const location = useLocation();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => setProgress(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", updateDuration);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", updateDuration);
    };
  }, [audioRef, currentSong]);

  if (!currentSong) return null;
  if (location.pathname === "/now-playing") return null;

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    audio.currentTime = percentage * duration;
    setProgress(percentage * duration);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className="glass"
      style={{
        position: "fixed",
        bottom: "1.5rem",
        left: "50%",
        transform: "translateX(-50%)",
        width: "90%",
        maxWidth: "800px",
        zIndex: 200,
        padding: "0.75rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        borderRadius: "20px",
        boxShadow:
          "0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)",
      }}
    >
      {/* Progress Bar */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <span
          style={{
            fontSize: "0.72rem",
            color: "var(--text-muted)",
            minWidth: "32px",
          }}
        >
          {formatTime(progress)}
        </span>
        <div
          onClick={handleSeek}
          style={{
            flex: 1,
            height: "4px",
            background: "rgba(255,255,255,0.15)",
            borderRadius: "2px",
            cursor: "pointer",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: `${duration ? (progress / duration) * 100 : 0}%`,
              background: "linear-gradient(90deg, #6c3dd3, #0ea5e9)",
              borderRadius: "2px",
              transition: "width 0.1s linear",
            }}
          />
        </div>
        <span
          style={{
            fontSize: "0.72rem",
            color: "var(--text-muted)",
            minWidth: "32px",
          }}
        >
          {formatTime(duration)}
        </span>
      </div>

      {/* Controls Row */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {/* Song Info */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            flex: 1,
            cursor: "pointer",
            minWidth: 0,
          }}
          onClick={() => navigate("/now-playing")}
        >
          <img
            src={currentSong.coverImage}
            alt={currentSong.title}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              objectFit: "cover",
              flexShrink: 0,
            }}
          />
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                fontSize: "0.88rem",
                fontWeight: "600",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {currentSong.title}
            </p>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              {currentSong.singer}
            </p>
          </div>
          <span
            style={{
              fontSize: "0.72rem",
              color: "var(--text-muted)",
              flexShrink: 0,
            }}
          >
            ↑ Expand
          </span>
        </div>

        {/* Playback Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button
            onClick={() => setIsShuffle(!isShuffle)}
            style={{
              background: isShuffle ? "rgba(108,61,211,0.4)" : "transparent",
              border: "none",
              color: isShuffle ? "#fff" : "var(--text-muted)",
              cursor: "pointer",
              fontSize: "1rem",
              padding: "0.3rem",
            }}
          >
            🔀
          </button>

          <button
            onClick={handlePrev}
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              fontSize: "1.1rem",
              padding: "0.3rem",
            }}
          >
            ⏮
          </button>

          <button
            className="btn-primary"
            onClick={() => playSong(currentSong)}
            style={{ padding: "0.5rem 1.4rem", fontSize: "0.9rem" }}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>

          <button
            onClick={handleNext}
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              fontSize: "1.1rem",
              padding: "0.3rem",
            }}
          >
            ⏭
          </button>

          <button
            onClick={() => setIsRepeat(!isRepeat)}
            style={{
              background: isRepeat ? "rgba(108,61,211,0.4)" : "transparent",
              border: "none",
              color: isRepeat ? "#fff" : "var(--text-muted)",
              cursor: "pointer",
              fontSize: "1rem",
              padding: "0.3rem",
            }}
          >
            🔁
          </button>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />
      </div>
    </div>
  );
};

export default PlayerBar;
