import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import NowPlaying from "../pages/NowPlaying";

const mockHandleNext = vi.fn();
const mockHandlePrev = vi.fn();
const mockPlaySong = vi.fn();
const mockSetIsRepeat = vi.fn();
const mockSetIsShuffle = vi.fn();
const mockNavigate = vi.fn();

const mockAudioRef = {
  current: {
    currentTime: 30,
    duration: 180,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    pause: vi.fn(),
    play: vi.fn(),
  },
};

const mockSong = {
  _id: "1",
  title: "Blinding Lights",
  singer: "The Weeknd",
  musicDirector: "Oscar Holter",
  album: "After Hours",
  releaseDate: "2019-11-29T00:00:00.000Z",
  url: "https://example.com/song.mp3",
  coverImage: "https://picsum.photos/seed/1/200",
  isVisible: true,
};

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockUsePlayer = (overrides = {}) => ({
  currentSong: mockSong,
  isPlaying: true,
  isRepeat: false,
  isShuffle: false,
  setIsRepeat: mockSetIsRepeat,
  setIsShuffle: mockSetIsShuffle,
  playSong: mockPlaySong,
  handleNext: mockHandleNext,
  handlePrev: mockHandlePrev,
  audioRef: mockAudioRef,
  ...overrides,
});

vi.mock("../context/PlayerContext", () => ({
  usePlayer: vi.fn(),
}));

const renderNowPlaying = () =>
  render(
    <MemoryRouter>
      <NowPlaying />
    </MemoryRouter>
  );

describe("NowPlaying Component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { usePlayer } = await import("../context/PlayerContext");
    vi.mocked(usePlayer).mockReturnValue(mockUsePlayer());
  });

  describe("No Song State", () => {
    it("shows no song message when nothing is playing", async () => {
      const { usePlayer } = await import("../context/PlayerContext");
      vi.mocked(usePlayer).mockReturnValue(
        mockUsePlayer({ currentSong: null })
      );

      renderNowPlaying();
      expect(screen.getByText("No song is playing")).toBeInTheDocument();
    });

    it("shows Go to Library button when no song", async () => {
      const { usePlayer } = await import("../context/PlayerContext");
      vi.mocked(usePlayer).mockReturnValue(
        mockUsePlayer({ currentSong: null })
      );

      renderNowPlaying();
      expect(
        screen.getByRole("button", { name: /Go to Library/i })
      ).toBeInTheDocument();
    });

    it("navigates to /library when Go to Library is clicked", async () => {
      const { usePlayer } = await import("../context/PlayerContext");
      vi.mocked(usePlayer).mockReturnValue(
        mockUsePlayer({ currentSong: null })
      );

      renderNowPlaying();
      fireEvent.click(screen.getByRole("button", { name: /Go to Library/i }));
      expect(mockNavigate).toHaveBeenCalledWith("/library");
    });
  });

  describe("Rendering with Song", () => {
    it("renders song title", () => {
      renderNowPlaying();
      expect(screen.getByText("Blinding Lights")).toBeInTheDocument();
    });

    it("renders singer name", () => {
      renderNowPlaying();
      expect(screen.getByText("The Weeknd")).toBeInTheDocument();
    });

    it("renders album and music director", () => {
      renderNowPlaying();
      expect(
        screen.getByText("After Hours • Oscar Holter")
      ).toBeInTheDocument();
    });

    it("renders cover image with correct src", () => {
      renderNowPlaying();
      const img = screen.getByAltText("Blinding Lights");
      expect(img).toHaveAttribute("src", mockSong.coverImage);
    });

    it("renders release year in meta tags", () => {
      renderNowPlaying();
      expect(screen.getByText("📅 2019")).toBeInTheDocument();
    });

    it("renders music director meta tag", () => {
      renderNowPlaying();
      expect(screen.getByText("🎼 Oscar Holter")).toBeInTheDocument();
    });

    it("renders album meta tag", () => {
      renderNowPlaying();
      expect(screen.getByText("💿 After Hours")).toBeInTheDocument();
    });

    it("renders Back button", () => {
      renderNowPlaying();
      expect(
        screen.getByRole("button", { name: /← Back/i })
      ).toBeInTheDocument();
    });

    it("shows pause button when song is playing", () => {
      renderNowPlaying();
      expect(screen.getByRole("button", { name: "⏸" })).toBeInTheDocument();
    });

    it("shows play button when song is paused", async () => {
      const { usePlayer } = await import("../context/PlayerContext");
      vi.mocked(usePlayer).mockReturnValue(mockUsePlayer({ isPlaying: false }));

      renderNowPlaying();
      expect(screen.getByRole("button", { name: "▶" })).toBeInTheDocument();
    });
  });

  describe("Controls", () => {
    it("calls navigate(-1) when Back is clicked", () => {
      renderNowPlaying();
      fireEvent.click(screen.getByRole("button", { name: /← Back/i }));
      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it("calls playSong when play/pause button is clicked", () => {
      renderNowPlaying();
      fireEvent.click(screen.getByRole("button", { name: "⏸" }));
      expect(mockPlaySong).toHaveBeenCalledWith(mockSong);
    });

    it("calls handleNext when next button is clicked", () => {
      renderNowPlaying();
      fireEvent.click(screen.getByRole("button", { name: "⏭" }));
      expect(mockHandleNext).toHaveBeenCalled();
    });

    it("calls handlePrev when prev button is clicked", () => {
      renderNowPlaying();
      fireEvent.click(screen.getByRole("button", { name: "⏮" }));
      expect(mockHandlePrev).toHaveBeenCalled();
    });

    it("toggles repeat when repeat button is clicked", () => {
      renderNowPlaying();
      fireEvent.click(screen.getByRole("button", { name: "🔁" }));
      expect(mockSetIsRepeat).toHaveBeenCalledWith(true);
    });

    it("toggles shuffle when shuffle button is clicked", () => {
      renderNowPlaying();
      fireEvent.click(screen.getByRole("button", { name: "🔀" }));
      expect(mockSetIsShuffle).toHaveBeenCalledWith(true);
    });

    it("shows repeat button active when repeat is on", async () => {
      const { usePlayer } = await import("../context/PlayerContext");
      vi.mocked(usePlayer).mockReturnValue(mockUsePlayer({ isRepeat: true }));

      renderNowPlaying();
      const repeatBtn = screen.getByRole("button", { name: "🔁" });
      expect(repeatBtn).toHaveStyle("background: rgba(108,61,211,0.4)");
    });

    it("shows shuffle button active when shuffle is on", async () => {
      const { usePlayer } = await import("../context/PlayerContext");
      vi.mocked(usePlayer).mockReturnValue(mockUsePlayer({ isShuffle: true }));

      renderNowPlaying();
      const shuffleBtn = screen.getByRole("button", { name: "🔀" });
      expect(shuffleBtn).toHaveStyle("background: rgba(108,61,211,0.4)");
    });
  });

  describe("Time Display", () => {
    it("renders formatted time from audioRef", () => {
      renderNowPlaying();
      expect(screen.getByText("0:30")).toBeInTheDocument();
      expect(screen.getByText("3:00")).toBeInTheDocument();
    });
  });
});
