import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import * as api from "../services/api";
import Library from "../pages/Library";

vi.mock("../services/api", () => ({
  getAllSongs: vi.fn(),
  searchSongs: vi.fn(),
  getMyPlaylists: vi.fn(),
  addSongToPlaylist: vi.fn(),
}));

vi.mock("../context/PlayerContext", () => ({
  usePlayer: () => ({
    currentSong: null,
    isPlaying: false,
    playSong: vi.fn(),
  }),
}));

const mockSongs = [
  {
    _id: "1",
    title: "Blinding Lights",
    singer: "The Weeknd",
    musicDirector: "Oscar Holter",
    album: "After Hours",
    url: "https://example.com/song1.mp3",
    coverImage: "https://picsum.photos/seed/1/200",
    isVisible: true,
  },
  {
    _id: "2",
    title: "Starlight",
    singer: "John Doe",
    musicDirector: "Brian Eno",
    album: "Cosmos",
    url: "https://example.com/song2.mp3",
    coverImage: "https://picsum.photos/seed/2/200",
    isVisible: true,
  },
];

const mockPlaylists = [
  {
    _id: "p1",
    name: "My Favourites",
    songs: [],
  },
  {
    _id: "p2",
    name: "Chill Vibes",
    songs: [{ _id: "1" }],
  },
];

const renderLibrary = () =>
  render(
    <MemoryRouter>
      <Library />
    </MemoryRouter>
  );

describe("Library Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.getMyPlaylists).mockResolvedValue({ data: mockPlaylists });
  });

  describe("Rendering", () => {
    it("shows loading state initially", () => {
      vi.mocked(api.getAllSongs).mockImplementation(
        () => new Promise(() => {})
      );
      renderLibrary();
      expect(screen.getByText("Loading songs...")).toBeInTheDocument();
    });

    it("renders Music Library heading", async () => {
      vi.mocked(api.getAllSongs).mockResolvedValueOnce({ data: mockSongs });
      renderLibrary();
      expect(await screen.findByText("Music Library")).toBeInTheDocument();
    });

    it("renders song cards after loading", async () => {
      vi.mocked(api.getAllSongs).mockResolvedValueOnce({ data: mockSongs });
      renderLibrary();
      expect(await screen.findByText("Blinding Lights")).toBeInTheDocument();
      expect(await screen.findByText("Starlight")).toBeInTheDocument();
    });

    it("renders singer names", async () => {
      vi.mocked(api.getAllSongs).mockResolvedValueOnce({ data: mockSongs });
      renderLibrary();
      expect(await screen.findByText("The Weeknd")).toBeInTheDocument();
      expect(await screen.findByText("John Doe")).toBeInTheDocument();
    });

    it("shows empty state when no songs found", async () => {
      vi.mocked(api.getAllSongs).mockResolvedValueOnce({ data: [] });
      renderLibrary();
      expect(await screen.findByText("No songs found")).toBeInTheDocument();
    });

    it("renders search bar", async () => {
      vi.mocked(api.getAllSongs).mockResolvedValueOnce({ data: mockSongs });
      renderLibrary();
      expect(
        await screen.findByPlaceholderText(
          "Search by title, singer, album, music director..."
        )
      ).toBeInTheDocument();
    });

    it("renders Play buttons for each song", async () => {
      vi.mocked(api.getAllSongs).mockResolvedValueOnce({ data: mockSongs });
      renderLibrary();
      const playButtons = await screen.findAllByRole("button", {
        name: /▶ Play/i,
      });
      expect(playButtons).toHaveLength(2);
    });
  });

  describe("Search", () => {
    it("calls searchSongs when typing in search bar", async () => {
      vi.mocked(api.getAllSongs).mockResolvedValueOnce({ data: mockSongs });
      vi.mocked(api.searchSongs).mockResolvedValueOnce({
        data: [mockSongs[0]],
      });

      renderLibrary();
      const searchInput = await screen.findByPlaceholderText(
        "Search by title, singer, album, music director..."
      );

      fireEvent.change(searchInput, { target: { value: "Blinding" } });

      await waitFor(() => {
        expect(api.searchSongs).toHaveBeenCalledWith("Blinding");
      });
    });

    it("fetches all songs when search is cleared", async () => {
      vi.mocked(api.getAllSongs).mockResolvedValue({ data: mockSongs });
      vi.mocked(api.searchSongs).mockResolvedValueOnce({
        data: [mockSongs[0]],
      });

      renderLibrary();
      const searchInput = await screen.findByPlaceholderText(
        "Search by title, singer, album, music director..."
      );

      fireEvent.change(searchInput, { target: { value: "Blinding" } });
      fireEvent.change(searchInput, { target: { value: "" } });

      await waitFor(() => {
        expect(api.getAllSongs).toHaveBeenCalledTimes(2);
      });
    });

    it("shows filtered results after search", async () => {
      vi.mocked(api.getAllSongs).mockResolvedValueOnce({ data: mockSongs });
      vi.mocked(api.searchSongs).mockResolvedValueOnce({
        data: [mockSongs[0]],
      });

      renderLibrary();
      const searchInput = await screen.findByPlaceholderText(
        "Search by title, singer, album, music director..."
      );

      fireEvent.change(searchInput, { target: { value: "Blinding" } });

      await waitFor(() => {
        expect(screen.queryByText("Starlight")).not.toBeInTheDocument();
      });
    });
  });

  describe("3 Dots Menu", () => {
    it("shows dropdown when 3 dots button is clicked", async () => {
      vi.mocked(api.getAllSongs).mockResolvedValueOnce({ data: mockSongs });
      renderLibrary();

      const menuButtons = await screen.findAllByText("⋮");
      fireEvent.click(menuButtons[0]);

      expect(screen.getByText("Add to Playlist")).toBeInTheDocument();
    });

    it("closes dropdown when clicked again", async () => {
      vi.mocked(api.getAllSongs).mockResolvedValueOnce({ data: mockSongs });
      renderLibrary();

      const menuButtons = await screen.findAllByText("⋮");
      fireEvent.click(menuButtons[0]);
      fireEvent.click(menuButtons[0]);

      expect(screen.queryByText("Add to Playlist")).not.toBeInTheDocument();
    });
  });

  describe("Add to Playlist Modal", () => {
    it("opens modal when Add to Playlist is clicked", async () => {
      vi.mocked(api.getAllSongs).mockResolvedValueOnce({ data: mockSongs });
      renderLibrary();

      const menuButtons = await screen.findAllByText("⋮");
      fireEvent.click(menuButtons[0]);
      fireEvent.click(screen.getByText("Add to Playlist"));

      expect(await screen.findByText("My Favourites")).toBeInTheDocument();
    });

    it("closes modal when Close is clicked", async () => {
      vi.mocked(api.getAllSongs).mockResolvedValueOnce({ data: mockSongs });
      renderLibrary();

      const menuButtons = await screen.findAllByText("⋮");
      fireEvent.click(menuButtons[0]);
      fireEvent.click(screen.getByText("Add to Playlist"));

      await screen.findByText("My Favourites");
      fireEvent.click(screen.getByRole("button", { name: /Close/i }));

      expect(screen.queryByText("My Favourites")).not.toBeInTheDocument();
    });

    it("shows Added badge for songs already in playlist", async () => {
      vi.mocked(api.getAllSongs).mockResolvedValueOnce({ data: mockSongs });
      renderLibrary();

      const menuButtons = await screen.findAllByText("⋮");
      fireEvent.click(menuButtons[0]);
      fireEvent.click(screen.getByText("Add to Playlist"));

      expect(await screen.findByText("✓ Added")).toBeInTheDocument();
      expect(await screen.findByText("+ Add")).toBeInTheDocument();
    });

    it("shows empty message when no playlists exist", async () => {
      vi.mocked(api.getAllSongs).mockResolvedValueOnce({ data: mockSongs });
      vi.mocked(api.getMyPlaylists).mockResolvedValue({ data: [] });
      renderLibrary();

      const menuButtons = await screen.findAllByText("⋮");
      fireEvent.click(menuButtons[0]);
      fireEvent.click(screen.getByText("Add to Playlist"));

      expect(
        await screen.findByText("No playlists yet. Create one first!")
      ).toBeInTheDocument();
    });

    it("calls addSongToPlaylist when playlist is clicked", async () => {
      vi.mocked(api.getAllSongs).mockResolvedValueOnce({ data: mockSongs });
      vi.mocked(api.addSongToPlaylist).mockResolvedValueOnce({});
      vi.mocked(api.getMyPlaylists).mockResolvedValue({ data: mockPlaylists });

      renderLibrary();

      const menuButtons = await screen.findAllByText("⋮");
      fireEvent.click(menuButtons[0]);
      fireEvent.click(screen.getByText("Add to Playlist"));

      await screen.findByText("My Favourites");

      fireEvent.click(screen.getByText("My Favourites").closest("div[style]"));

      await waitFor(() => {
        expect(api.addSongToPlaylist).toHaveBeenCalledWith("p1", "1");
      });
    });
  });
});
