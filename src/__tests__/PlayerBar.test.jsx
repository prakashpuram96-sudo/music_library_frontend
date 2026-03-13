import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import PlayerBar from "../components/PlayerBar";

const mockHandleNext = vi.fn();
const mockHandlePrev = vi.fn();
const mockPlaySong = vi.fn();
const mockSetIsRepeat = vi.fn();
const mockSetIsShuffle = vi.fn();
const mockNavigate = vi.fn();

const mockAudioRef = {
  current: {
    currentTime: 45,
    duration: 200,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
};

const mockSong = {
  _id: "1",
  title: "Blinding Lights",
  singer: "The Weeknd",
  coverImage: "https://picsum.photos/seed/1/200",
  url: "https://example.com/song.mp3",
};

vi.mock("../context/PlayerContext", () => ({
  usePlayer: vi.fn(),
}));

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

const renderPlayerBar = (path = "/library") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <PlayerBar />
    </MemoryRouter>
  );

describe("PlayerBar Component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { usePlayer } = await import("../context/PlayerContext");
    vi.mocked(usePlayer).mockReturnValue(mockUsePlayer());
  });

  describe("Visibility", () => {
    it("renders nothing when no song is playing", async () => {
      const { usePlayer } = await import("../context/PlayerContext");
      vi.mocked(usePlayer).mockReturnValue(
        mockUsePlayer({ currentSong: null })
      );
      const { container } = renderPlayerBar();
      expect(container.firstChild).toBeNull();
    });

    it("renders nothing on /now-playing route", () => {
      const { container } = renderPlayerBar("/now-playing");
      expect(container.firstChild).toBeNull();
    });

    it("renders when a song is playing on /library", () => {
      renderPlayerBar("/library");
      expect(screen.getByText("Blinding Lights")).toBeInTheDocument();
    });

    it("renders when a song is playing on /playlists", () => {
      renderPlayerBar("/playlists");
      expect(screen.getByText("Blinding Lights")).toBeInTheDocument();
    });
  });

  describe("Rendering", () => {
    it("renders song title", () => {
      renderPlayerBar();
      expect(screen.getByText("Blinding Lights")).toBeInTheDocument();
    });

    it("renders singer name", () => {
      renderPlayerBar();
      expect(screen.getByText("The Weeknd")).toBeInTheDocument();
    });

    it("renders cover image", () => {
      renderPlayerBar();
      const img = screen.getByAltText("Blinding Lights");
      expect(img).toHaveAttribute("src", mockSong.coverImage);
    });

    it("renders Expand button", () => {
      renderPlayerBar();
      expect(screen.getByText("↑ Expand")).toBeInTheDocument();
    });

    it("shows pause button when playing", () => {
      renderPlayerBar();
      expect(screen.getByRole("button", { name: "⏸" })).toBeInTheDocument();
    });

    it("shows play button when paused", async () => {
      const { usePlayer } = await import("../context/PlayerContext");
      vi.mocked(usePlayer).mockReturnValue(mockUsePlayer({ isPlaying: false }));
      renderPlayerBar();
      expect(screen.getByRole("button", { name: "▶" })).toBeInTheDocument();
    });

    it("renders all control buttons", () => {
      renderPlayerBar();
      expect(screen.getByRole("button", { name: "🔀" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "⏮" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "⏸" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "⏭" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "🔁" })).toBeInTheDocument();
    });
  });

  describe("Controls", () => {
    it("calls playSong when play/pause clicked", () => {
      renderPlayerBar();
      fireEvent.click(screen.getByRole("button", { name: "⏸" }));
      expect(mockPlaySong).toHaveBeenCalledWith(mockSong);
    });

    it("calls handleNext when next clicked", () => {
      renderPlayerBar();
      fireEvent.click(screen.getByRole("button", { name: "⏭" }));
      expect(mockHandleNext).toHaveBeenCalled();
    });

    it("calls handlePrev when prev clicked", () => {
      renderPlayerBar();
      fireEvent.click(screen.getByRole("button", { name: "⏮" }));
      expect(mockHandlePrev).toHaveBeenCalled();
    });

    it("toggles repeat off→on", () => {
      renderPlayerBar();
      fireEvent.click(screen.getByRole("button", { name: "🔁" }));
      expect(mockSetIsRepeat).toHaveBeenCalledWith(true);
    });

    it("toggles repeat on→off", async () => {
      const { usePlayer } = await import("../context/PlayerContext");
      vi.mocked(usePlayer).mockReturnValue(mockUsePlayer({ isRepeat: true }));
      renderPlayerBar();
      fireEvent.click(screen.getByRole("button", { name: "🔁" }));
      expect(mockSetIsRepeat).toHaveBeenCalledWith(false);
    });

    it("toggles shuffle off→on", () => {
      renderPlayerBar();
      fireEvent.click(screen.getByRole("button", { name: "🔀" }));
      expect(mockSetIsShuffle).toHaveBeenCalledWith(true);
    });

    it("toggles shuffle on→off", async () => {
      const { usePlayer } = await import("../context/PlayerContext");
      vi.mocked(usePlayer).mockReturnValue(mockUsePlayer({ isShuffle: true }));
      renderPlayerBar();
      fireEvent.click(screen.getByRole("button", { name: "🔀" }));
      expect(mockSetIsShuffle).toHaveBeenCalledWith(false);
    });

    it("navigates to /now-playing when song info is clicked", () => {
      renderPlayerBar();
      fireEvent.click(screen.getByText("↑ Expand"));
      expect(mockNavigate).toHaveBeenCalledWith("/now-playing");
    });
  });

  describe("Active State Styling", () => {
    it("shows repeat button as active when repeat is on", async () => {
      const { usePlayer } = await import("../context/PlayerContext");
      vi.mocked(usePlayer).mockReturnValue(mockUsePlayer({ isRepeat: true }));
      renderPlayerBar();
      const repeatBtn = screen.getByRole("button", { name: "🔁" });
      expect(repeatBtn).toHaveStyle("background: rgba(108,61,211,0.4)");
    });

    it("shows shuffle button as active when shuffle is on", async () => {
      const { usePlayer } = await import("../context/PlayerContext");
      vi.mocked(usePlayer).mockReturnValue(mockUsePlayer({ isShuffle: true }));
      renderPlayerBar();
      const shuffleBtn = screen.getByRole("button", { name: "🔀" });
      expect(shuffleBtn).toHaveStyle("background: rgba(108,61,211,0.4)");
    });
  });

  describe("Time Display", () => {
    it("renders formatted time labels", () => {
      renderPlayerBar();
      const timeLabels = screen.getAllByText("0:00");
      expect(timeLabels).toHaveLength(2);
    });
  });
});
