import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import * as api from "../services/api";
import PlaylistDetail from "../pages/PlaylistDetail";

vi.mock("../services/api", () => ({
  getPlaylistById: vi.fn(),
  getAllSongs: vi.fn(),
  addSongToPlaylist: vi.fn(),
  removeSongFromPlaylist: vi.fn(),
  searchSongsInPlaylist: vi.fn(),
}));

vi.mock("../context/PlayerContext", () => ({
  usePlayer: () => ({
    currentSong: null,
    isPlaying: false,
    playSong: vi.fn(),
  }),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockSongs = [
  {
    _id: "s1",
    title: "Blinding Lights",
    singer: "The Weeknd",
    album: "After Hours",
    coverImage: "https://picsum.photos/seed/1/200",
    isVisible: true,
  },
  {
    _id: "s2",
    title: "Starlight",
    singer: "John Doe",
    album: "Cosmos",
    coverImage: "https://picsum.photos/seed/2/200",
    isVisible: true,
  },
  {
    _id: "s3",
    title: "Hidden Track",
    singer: "Ghost",
    album: "Dark",
    coverImage: "https://picsum.photos/seed/3/200",
    isVisible: false,
  },
];

const mockPlaylist = {
  _id: "p1",
  name: "My Favourites",
  songs: [mockSongs[0], mockSongs[1]],
};

const renderDetail = () =>
  render(
    <MemoryRouter initialEntries={["/playlists/p1"]}>
      <Routes>
        <Route path="/playlists/:id" element={<PlaylistDetail />} />
      </Routes>
    </MemoryRouter>
  );

describe("PlaylistDetail Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.getPlaylistById).mockResolvedValue({ data: mockPlaylist });
    vi.mocked(api.getAllSongs).mockResolvedValue({ data: mockSongs });
  });

  describe("Loading & Error States", () => {
    it("shows loading state initially", () => {
      vi.mocked(api.getPlaylistById).mockImplementation(
        () => new Promise(() => {})
      );
      renderDetail();
      expect(screen.getByText("Loading playlist...")).toBeInTheDocument();
    });

    it("shows not found message when playlist missing", async () => {
      vi.mocked(api.getPlaylistById).mockRejectedValueOnce(
        new Error("Not found")
      );
      renderDetail();
      expect(await screen.findByText("Playlist not found")).toBeInTheDocument();
    });

    it("navigates to /playlists when Back to Playlists clicked on not found", async () => {
      vi.mocked(api.getPlaylistById).mockRejectedValueOnce(
        new Error("Not found")
      );
      renderDetail();
      fireEvent.click(
        await screen.findByRole("button", { name: /Back to Playlists/i })
      );
      expect(mockNavigate).toHaveBeenCalledWith("/playlists");
    });
  });

  describe("Rendering", () => {
    it("renders playlist name", async () => {
      renderDetail();
      expect(await screen.findByText("My Favourites")).toBeInTheDocument();
    });

    it("renders song count", async () => {
      renderDetail();
      expect(await screen.findByText(/2 songs/i)).toBeInTheDocument();
    });

    it("renders song titles", async () => {
      renderDetail();
      expect(await screen.findByText("Blinding Lights")).toBeInTheDocument();
      expect(await screen.findByText("Starlight")).toBeInTheDocument();
    });

    it("renders singer and album info", async () => {
      renderDetail();
      expect(
        await screen.findByText("The Weeknd • After Hours")
      ).toBeInTheDocument();
    });

    it("renders Back button", async () => {
      renderDetail();
      expect(
        await screen.findByRole("button", { name: /← Back/i })
      ).toBeInTheDocument();
    });

    it("renders Play All button when songs exist", async () => {
      renderDetail();
      expect(
        await screen.findByRole("button", { name: /▶ Play All/i })
      ).toBeInTheDocument();
    });

    it("renders Remove button for each song", async () => {
      renderDetail();
      const removeBtns = await screen.findAllByRole("button", {
        name: /Remove/i,
      });
      expect(removeBtns).toHaveLength(2);
    });

    it("renders Unavailable badge for hidden songs", async () => {
      vi.mocked(api.getPlaylistById).mockResolvedValueOnce({
        data: { ...mockPlaylist, songs: [mockSongs[2]] },
      });
      renderDetail();
      expect(await screen.findByText("Unavailable")).toBeInTheDocument();
    });

    it("shows empty state when playlist has no songs", async () => {
      vi.mocked(api.getPlaylistById).mockResolvedValueOnce({
        data: { ...mockPlaylist, songs: [] },
      });
      renderDetail();
      expect(await screen.findByText("No songs yet")).toBeInTheDocument();
    });
  });

  describe("Navigation", () => {
    it("navigates to /playlists when Back is clicked", async () => {
      renderDetail();
      fireEvent.click(await screen.findByRole("button", { name: /← Back/i }));
      expect(mockNavigate).toHaveBeenCalledWith("/playlists");
    });
  });

  describe("Add Songs Panel", () => {
    it("shows panel when + Add Songs is clicked", async () => {
      renderDetail();
      fireEvent.click(
        await screen.findByRole("button", { name: /\+ Add Songs/i })
      );
      expect(
        await screen.findByText("Add Songs to Playlist")
      ).toBeInTheDocument();
    });

    it("hides panel when ✕ Close is clicked", async () => {
      renderDetail();
      fireEvent.click(
        await screen.findByRole("button", { name: /\+ Add Songs/i })
      );
      await screen.findByText("Add Songs to Playlist");
      fireEvent.click(screen.getByRole("button", { name: /✕ Close/i }));
      expect(
        screen.queryByText("Add Songs to Playlist")
      ).not.toBeInTheDocument();
    });

    it("fetches all songs when panel opens", async () => {
      renderDetail();
      fireEvent.click(
        await screen.findByRole("button", { name: /\+ Add Songs/i })
      );
      await waitFor(() => {
        expect(api.getAllSongs).toHaveBeenCalled();
      });
    });

    it("shows Added badge for songs already in playlist", async () => {
      renderDetail();
      fireEvent.click(
        await screen.findByRole("button", { name: /\+ Add Songs/i })
      );
      const addedBadges = await screen.findAllByText("✓ Added");
      expect(addedBadges.length).toBeGreaterThanOrEqual(1);
    });

    it("calls addSongToPlaylist when + Add is clicked", async () => {
      vi.mocked(api.addSongToPlaylist).mockResolvedValueOnce({
        data: { ...mockPlaylist, songs: [...mockPlaylist.songs, mockSongs[2]] },
      });
      renderDetail();
      fireEvent.click(
        await screen.findByRole("button", { name: /\+ Add Songs/i })
      );
      const addBtns = await screen.findAllByRole("button", { name: /\+ Add/i });
      fireEvent.click(addBtns[0]);
      await waitFor(() => {
        expect(api.addSongToPlaylist).toHaveBeenCalledWith("p1", "s3");
      });
    });
  });

  describe("Remove Song", () => {
    it("calls removeSongFromPlaylist when Remove is clicked", async () => {
      vi.mocked(api.removeSongFromPlaylist).mockResolvedValueOnce({
        data: { ...mockPlaylist, songs: [mockSongs[1]] },
      });
      renderDetail();
      const removeBtns = await screen.findAllByRole("button", {
        name: /Remove/i,
      });
      fireEvent.click(removeBtns[0]);
      await waitFor(() => {
        expect(api.removeSongFromPlaylist).toHaveBeenCalledWith("p1", "s1");
      });
    });
  });

  describe("Search in Playlist", () => {
    it("renders search bar when songs exist", async () => {
      renderDetail();
      expect(
        await screen.findByPlaceholderText("Search songs in playlist...")
      ).toBeInTheDocument();
    });

    it("calls searchSongsInPlaylist when typing", async () => {
      vi.mocked(api.searchSongsInPlaylist).mockResolvedValueOnce({
        data: [mockSongs[0]],
      });
      renderDetail();
      const searchInput = await screen.findByPlaceholderText(
        "Search songs in playlist..."
      );
      fireEvent.change(searchInput, { target: { value: "Blinding" } });
      await waitFor(() => {
        expect(api.searchSongsInPlaylist).toHaveBeenCalledWith(
          "p1",
          "Blinding"
        );
      });
    });

    it("clears search results when query is empty", async () => {
      vi.mocked(api.searchSongsInPlaylist).mockResolvedValueOnce({
        data: [mockSongs[0]],
      });
      renderDetail();
      const searchInput = await screen.findByPlaceholderText(
        "Search songs in playlist..."
      );
      fireEvent.change(searchInput, { target: { value: "Blinding" } });
      fireEvent.change(searchInput, { target: { value: "" } });
      await waitFor(() => {
        expect(screen.queryByText("Starlight")).toBeInTheDocument();
      });
    });
  });
});
