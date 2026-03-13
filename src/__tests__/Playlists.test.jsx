import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import * as api from "../services/api";
import Playlists from "../pages/Playlists";

vi.mock("../services/api", () => ({
  getMyPlaylists: vi.fn(),
  createPlaylist: vi.fn(),
  updatePlaylist: vi.fn(),
  deletePlaylist: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockPlaylists = [
  { _id: "p1", name: "My Favourites", songs: [{ _id: "s1" }, { _id: "s2" }] },
  { _id: "p2", name: "Chill Vibes", songs: [] },
];

const renderPlaylists = () =>
  render(
    <MemoryRouter>
      <Playlists />
    </MemoryRouter>
  );

describe("Playlists Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.getMyPlaylists).mockResolvedValue({ data: mockPlaylists });
  });

  describe("Rendering", () => {
    it("shows loading state initially", () => {
      vi.mocked(api.getMyPlaylists).mockImplementation(
        () => new Promise(() => {})
      );
      renderPlaylists();
      expect(screen.getByText("Loading playlists...")).toBeInTheDocument();
    });

    it("renders My Playlists heading", async () => {
      renderPlaylists();
      expect(await screen.findByText("My Playlists")).toBeInTheDocument();
    });

    it("renders playlist names", async () => {
      renderPlaylists();
      expect(await screen.findByText("My Favourites")).toBeInTheDocument();
      expect(await screen.findByText("Chill Vibes")).toBeInTheDocument();
    });

    it("renders correct song counts", async () => {
      renderPlaylists();
      expect(await screen.findByText("2 songs")).toBeInTheDocument();
      expect(await screen.findByText("0 songs")).toBeInTheDocument();
    });

    it("renders Rename and Delete buttons for each playlist", async () => {
      renderPlaylists();
      const renameBtns = await screen.findAllByRole("button", {
        name: /✏️ Rename/i,
      });
      const deleteBtns = await screen.findAllByRole("button", {
        name: /🗑 Delete/i,
      });
      expect(renameBtns).toHaveLength(2);
      expect(deleteBtns).toHaveLength(2);
    });

    it("shows empty state when no playlists exist", async () => {
      vi.mocked(api.getMyPlaylists).mockResolvedValueOnce({ data: [] });
      renderPlaylists();
      expect(await screen.findByText("No playlists yet")).toBeInTheDocument();
    });

    it("renders + New Playlist button", async () => {
      renderPlaylists();
      expect(
        await screen.findByRole("button", { name: /\+ New Playlist/i })
      ).toBeInTheDocument();
    });
  });

  describe("Navigation", () => {
    it("navigates to playlist detail when clicked", async () => {
      renderPlaylists();
      const playlist = await screen.findByText("My Favourites");
      fireEvent.click(playlist.closest("div[class]"));
      expect(mockNavigate).toHaveBeenCalledWith("/playlists/p1");
    });
  });

  describe("Create Playlist", () => {
    it("shows create form when + New Playlist is clicked", async () => {
      renderPlaylists();
      fireEvent.click(
        await screen.findByRole("button", { name: /\+ New Playlist/i })
      );
      expect(screen.getByText("Create New Playlist")).toBeInTheDocument();
    });

    it("hides create form when ✕ Cancel is clicked", async () => {
      renderPlaylists();
      fireEvent.click(
        await screen.findByRole("button", { name: /\+ New Playlist/i })
      );
      fireEvent.click(screen.getByRole("button", { name: /✕ Cancel/i }));
      expect(screen.queryByText("Create New Playlist")).not.toBeInTheDocument();
    });

    it("shows validation error when name is empty", async () => {
      renderPlaylists();
      fireEvent.click(
        await screen.findByRole("button", { name: /\+ New Playlist/i })
      );
      fireEvent.click(screen.getByRole("button", { name: /^Create$/i }));
      expect(
        screen.getByText("Playlist name cannot be empty")
      ).toBeInTheDocument();
    });

    it("creates playlist successfully", async () => {
      const newPlaylist = { _id: "p3", name: "New Mix", songs: [] };
      vi.mocked(api.createPlaylist).mockResolvedValueOnce({
        data: newPlaylist,
      });

      renderPlaylists();
      fireEvent.click(
        await screen.findByRole("button", { name: /\+ New Playlist/i })
      );

      fireEvent.change(screen.getByPlaceholderText("Enter playlist name..."), {
        target: { value: "New Mix" },
      });
      fireEvent.click(screen.getByRole("button", { name: /^Create$/i }));

      await waitFor(() => {
        expect(api.createPlaylist).toHaveBeenCalledWith({ name: "New Mix" });
      });
      expect(await screen.findByText("New Mix")).toBeInTheDocument();
    });

    it("shows API error when create fails", async () => {
      vi.mocked(api.createPlaylist).mockRejectedValueOnce({
        response: { data: { message: "Playlist already exists" } },
      });

      renderPlaylists();
      fireEvent.click(
        await screen.findByRole("button", { name: /\+ New Playlist/i })
      );

      fireEvent.change(screen.getByPlaceholderText("Enter playlist name..."), {
        target: { value: "My Favourites" },
      });
      fireEvent.click(screen.getByRole("button", { name: /^Create$/i }));

      expect(
        await screen.findByText("Playlist already exists")
      ).toBeInTheDocument();
    });

    it("creates playlist on Enter key press", async () => {
      const newPlaylist = { _id: "p3", name: "New Mix", songs: [] };
      vi.mocked(api.createPlaylist).mockResolvedValueOnce({
        data: newPlaylist,
      });

      renderPlaylists();
      fireEvent.click(
        await screen.findByRole("button", { name: /\+ New Playlist/i })
      );

      const input = screen.getByPlaceholderText("Enter playlist name...");
      fireEvent.change(input, { target: { value: "New Mix" } });
      fireEvent.keyDown(input, { key: "Enter" });

      await waitFor(() => {
        expect(api.createPlaylist).toHaveBeenCalledWith({ name: "New Mix" });
      });
    });
  });

  describe("Rename Playlist", () => {
    it("shows edit input when Rename is clicked", async () => {
      renderPlaylists();
      const renameBtns = await screen.findAllByRole("button", {
        name: /✏️ Rename/i,
      });
      fireEvent.click(renameBtns[0]);
      expect(screen.getByDisplayValue("My Favourites")).toBeInTheDocument();
    });

    it("shows Save and Cancel buttons in edit mode", async () => {
      renderPlaylists();
      const renameBtns = await screen.findAllByRole("button", {
        name: /✏️ Rename/i,
      });
      fireEvent.click(renameBtns[0]);
      expect(
        screen.getByRole("button", { name: /^Save$/i })
      ).toBeInTheDocument();
      expect(screen.getAllByRole("button", { name: /^Cancel$/i })).toBeTruthy();
    });

    it("saves updated name", async () => {
      const updated = { _id: "p1", name: "Updated Name", songs: [] };
      vi.mocked(api.updatePlaylist).mockResolvedValueOnce({ data: updated });

      renderPlaylists();
      const renameBtns = await screen.findAllByRole("button", {
        name: /✏️ Rename/i,
      });
      fireEvent.click(renameBtns[0]);

      const input = screen.getByDisplayValue("My Favourites");
      fireEvent.change(input, { target: { value: "Updated Name" } });
      fireEvent.click(screen.getByRole("button", { name: /^Save$/i }));

      await waitFor(() => {
        expect(api.updatePlaylist).toHaveBeenCalledWith("p1", {
          name: "Updated Name",
        });
      });
    });

    it("cancels rename without saving", async () => {
      renderPlaylists();
      const renameBtns = await screen.findAllByRole("button", {
        name: /✏️ Rename/i,
      });
      fireEvent.click(renameBtns[0]);

      fireEvent.click(screen.getByRole("button", { name: /^Cancel$/i }));

      expect(
        screen.queryByDisplayValue("My Favourites")
      ).not.toBeInTheDocument();
      expect(api.updatePlaylist).not.toHaveBeenCalled();
    });
  });

  describe("Delete Playlist", () => {
    it("deletes playlist when confirmed", async () => {
      vi.spyOn(window, "confirm").mockReturnValueOnce(true);
      vi.mocked(api.deletePlaylist).mockResolvedValueOnce({});

      renderPlaylists();
      const deleteBtns = await screen.findAllByRole("button", {
        name: /🗑 Delete/i,
      });
      fireEvent.click(deleteBtns[0]);

      await waitFor(() => {
        expect(api.deletePlaylist).toHaveBeenCalledWith("p1");
      });
      expect(screen.queryByText("My Favourites")).not.toBeInTheDocument();
    });

    it("does not delete when confirm is cancelled", async () => {
      vi.spyOn(window, "confirm").mockReturnValueOnce(false);

      renderPlaylists();
      const deleteBtns = await screen.findAllByRole("button", {
        name: /🗑 Delete/i,
      });
      fireEvent.click(deleteBtns[0]);

      expect(api.deletePlaylist).not.toHaveBeenCalled();
      expect(await screen.findByText("My Favourites")).toBeInTheDocument();
    });
  });
});
