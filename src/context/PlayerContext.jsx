import { createContext, useContext, useState, useRef, useEffect } from "react";

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [queue, setQueue] = useState([]);
  const audioRef = useRef(null);

  // This effect re-registers onEnded every time isRepeat or currentSong changes
  // so it NEVER reads a stale value
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play();
      } else {
        handleNext();
      }
    };

    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [isRepeat, currentSong, queue, isShuffle]);

  const playSong = (song, songs = []) => {
    if (currentSong?._id === song._id) {
      if (audioRef.current.paused) {
        audioRef.current.play();
        setIsPlaying(true);
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      if (audioRef.current) audioRef.current.pause();
      setCurrentSong(song);
      if (songs.length) setQueue(songs);
      setIsPlaying(true);
      setTimeout(() => audioRef.current?.play(), 100);
    }
  };

  const handleNext = () => {
    if (!queue.length) return;
    let nextSong;
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * queue.length);
      nextSong = queue[randomIndex];
    } else {
      const currentIndex = queue.findIndex((s) => s._id === currentSong?._id);
      const nextIndex = (currentIndex + 1) % queue.length;
      nextSong = queue[nextIndex];
    }
    if (audioRef.current) audioRef.current.pause();
    setCurrentSong(nextSong);
    setIsPlaying(true);
    setTimeout(() => audioRef.current?.play(), 100);
  };

  const handlePrev = () => {
    if (!queue.length) return;
    const currentIndex = queue.findIndex((s) => s._id === currentSong?._id);
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    const prevSong = queue[prevIndex];
    if (audioRef.current) audioRef.current.pause();
    setCurrentSong(prevSong);
    setIsPlaying(true);
    setTimeout(() => audioRef.current?.play(), 100);
  };

  const stopPlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setCurrentSong(null);
    setIsPlaying(false);
    setQueue([]);
  };

  return (
    <PlayerContext.Provider
      value={{
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
        stopPlayer,
      }}
    >
      <audio ref={audioRef} src={currentSong?.url} />
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);
