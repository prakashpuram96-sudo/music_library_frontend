import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import * as api from "../services/api";
import AdminDashboard from "../pages/AdminDashboard";

vi.mock("@mui/x-date-pickers/DatePicker", () => ({
  DatePicker: ({ value, onChange }) => (
    <input
      data-testid="date-picker"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

vi.mock("@mui/x-date-pickers/LocalizationProvider", () => ({
  LocalizationProvider: ({ children }) => children,
}));

vi.mock("@mui/x-date-pickers/AdapterDayjs", () => ({
  AdapterDayjs: class {},
}));

// Mock API
vi.mock("../services/api", () => ({
  getAllSongs: vi.fn(),
  addSong: vi.fn(),
  updateSong: vi.fn(),
  deleteSong: vi.fn(),
  toggleVisibility: vi.fn(),
}));

// Mock useToast
vi.mock("../hooks/useToast", () => ({
  default: () => ({
    toast: { open: false, message: "", severity: "success" },
    showToast: vi.fn(),
    hideToast: vi.fn(),
  }),
}));

const mockSongs = [
  {
    _id: "1",
    title: "Blinding Lights",
    singer: "The Weeknd",
    musicDirector: "Oscar Holter",
    album: "After Hours",
    releaseDate: "2019-11-29T00:00:00.000Z",
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
    releaseDate: "2021-05-10T00:00:00.000Z",
    url: "https://example.com/song2.mp3",
    coverImage: "https://picsum.photos/seed/2/200",
    isVisible: false,
  },
];

const renderDashboard = () =>
  render(
    <MemoryRouter>
      <AdminDashboard />
    </MemoryRouter>
  );

describe("AdminDashboard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("shows loading state initially", () => {
      vi.mocked(api.getAllSongs).mockImplementation(
        () => new Promise(() => {})
      );
      renderDashboard();
      expect(screen.getByText("Loading songs...")).toBeInTheDocument();
    });

    it("renders Admin Dashboard heading", async () => {
      vi.mocked(api.getAllSongs).mockResolvedValueOnce({ data: [] });
      renderDashboard();
      expect(await screen.findByText("Admin Dashboard")).toBeInTheDocument();
    });

    it("renders songs count after loading", async () => {
      vi.mocked(api.getAllSongs).mockResolvedValueOnce({ data: mockSongs });
      renderDashboard();
      expect(await screen.findByText("2 songs in library")).toBeInTheDocument();
    });

    it("renders song titles after loading", async () => {
      vi.mocked(api.getAllSongs).mockResolvedValueOnce({ data: mockSongs });
      renderDashboard();
      expect(await screen.findByText("Blinding Lights")).toBeInTheDocument();
      expect(await screen.findByText("Starlight")).toBeInTheDocument();
    });

    it("renders Hidden badge for invisible songs", async () => {
      vi.mocked(api.getAllSongs).mockResolvedValueOnce({ data: mockSongs });
      renderDashboard();
      expect(await screen.findByText("Hidden")).toBeInTheDocument();
    });

    it("renders Add Song button", async () => {
      vi.mocked(api.getAllSongs).mockResolvedValueOnce({ data: [] });
      renderDashboard();
      expect(
        await screen.findByRole("button", { name: /\+ Add Song/i })
      ).toBeInTheDocument();
    });
  });

  // ─── Add Form Tests ───
  describe("Add Song Form", () => {
    it("shows add form when Add Song button is clicked", async () => {
      vi.mocked(api.getAllSongs).mockResolvedValueOnce({ data: [] });
      renderDashboard();
      fireEvent.click(
        await screen.findByRole("button", { name: /\+ Add Song/i })
      );
      expect(screen.getByText("+ Add New Song")).toBeInTheDocument();
    });

    it("hides add form when Cancel button is clicked in header", async () => {
      vi.mocked(api.getAllSongs).mockResolvedValueOnce({ data: [] });
      renderDashboard();
      fireEvent.click(
        await screen.findByRole("button", { name: /\+ Add Song/i })
      );
      fireEvent.click(screen.getByRole("button", { name: /✕ Cancel/i }));
      expect(screen.queryByText("+ Add New Song")).not.toBeInTheDocument();
    });

    it("shows validation error when required fields are missing", async () => {
      vi.mocked(api.getAllSongs).mockResolvedValueOnce({ data: [] });
      renderDashboard();
      fireEvent.click(
        await screen.findByRole("button", { name: /\+ Add Song/i })
      );
      fireEvent.click(screen.getByRole("button", { name: /^Add Song$/i }));
      expect(
        await screen.findByText(
          "Title, Singer, Music Director and URL are required"
        )
      ).toBeInTheDocument();
    });

    it("adds a song successfully", async () => {
      vi.mocked(api.getAllSongs).mockResolvedValueOnce({ data: [] });
      vi.mocked(api.addSong).mockResolvedValueOnce({ data: mockSongs[0] });

      renderDashboard();
      fireEvent.click(
        await screen.findByRole("button", { name: /\+ Add Song/i })
      );

      fireEvent.change(screen.getByPlaceholderText("Song title *"), {
        target: { name: "title", value: "Blinding Lights" },
      });
      fireEvent.change(screen.getByPlaceholderText("Singer name *"), {
        target: { name: "singer", value: "The Weeknd" },
      });
      fireEvent.change(screen.getByPlaceholderText("Music director *"), {
        target: { name: "musicDirector", value: "Oscar Holter" },
      });
      fireEvent.change(screen.getAllByPlaceholderText("https://...")[0], {
        target: { name: "url", value: "https://example.com/song.mp3" },
      });

      fireEvent.click(screen.getByRole("button", { name: /^Add Song$/i }));

      await waitFor(() => {
        expect(api.addSong).toHaveBeenCalled();
      });
    });

    it("shows error when add song fails", async () => {
      vi.mocked(api.getAllSongs).mockResolvedValueOnce({ data: [] });
      vi.mocked(api.addSong).mockRejectedValueOnce({
        response: { data: { message: "Song already exists" } },
      });

      renderDashboard();
      fireEvent.click(
        await screen.findByRole("button", { name: /\+ Add Song/i })
      );

      fireEvent.change(screen.getByPlaceholderText("Song title *"), {
        target: { name: "title", value: "Blinding Lights" },
      });
      fireEvent.change(screen.getByPlaceholderText("Singer name *"), {
        target: { name: "singer", value: "The Weeknd" },
      });
      fireEvent.change(screen.getByPlaceholderText("Music director *"), {
        target: { name: "musicDirector", value: "Oscar Holter" },
      });
      fireEvent.change(screen.getAllByPlaceholderText("https://...")[0], {
        target: { name: "url", value: "https://example.com/song.mp3" },
      });

      fireEvent.click(screen.getByRole("button", { name: /^Add Song$/i }));

      expect(
        await screen.findByText("Song already exists")
      ).toBeInTheDocument();
    });
  });

  describe("Edit Song Form", () => {
    it("shows edit form with song data when Edit is clicked", async () => {
      vi.mocked(api.getAllSongs).mockResolvedValueOnce({ data: mockSongs });
      renderDashboard();

      const editButtons = await screen.findAllByText("✏️ Edit");
      fireEvent.click(editButtons[0]);

      expect(screen.getByText("✏️ Edit Song")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Blinding Lights")).toBeInTheDocument();
    });

    it("updates song successfully", async () => {
      vi.mocked(api.getAllSongs).mockResolvedValueOnce({ data: mockSongs });
      vi.mocked(api.updateSong).mockResolvedValueOnce({
        data: { ...mockSongs[0], title: "Updated Title" },
      });

      renderDashboard();
      const editButtons = await screen.findAllByText("✏️ Edit");
      fireEvent.click(editButtons[0]);

      fireEvent.change(screen.getByDisplayValue("Blinding Lights"), {
        target: { name: "title", value: "Updated Title" },
      });

      fireEvent.click(screen.getByRole("button", { name: /Update Song/i }));

      await waitFor(() => {
        expect(api.updateSong).toHaveBeenCalled();
      });
    });
  });

  describe("Delete Song", () => {
    it("deletes song when confirmed", async () => {
      vi.mocked(api.getAllSongs).mockResolvedValueOnce({ data: mockSongs });
      vi.mocked(api.deleteSong).mockResolvedValueOnce({});
      vi.spyOn(window, "confirm").mockReturnValueOnce(true);

      renderDashboard();
      const deleteButtons = await screen.findAllByText("🗑 Delete");
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(api.deleteSong).toHaveBeenCalledWith("1");
      });
    });

    it("does not delete song when cancelled", async () => {
      vi.mocked(api.getAllSongs).mockResolvedValueOnce({ data: mockSongs });
      vi.spyOn(window, "confirm").mockReturnValueOnce(false);

      renderDashboard();
      const deleteButtons = await screen.findAllByText("🗑 Delete");
      fireEvent.click(deleteButtons[0]);

      expect(api.deleteSong).not.toHaveBeenCalled();
    });
  });

  describe("Toggle Visibility", () => {
    it("toggles song visibility", async () => {
      vi.mocked(api.getAllSongs).mockResolvedValueOnce({ data: mockSongs });
      vi.mocked(api.toggleVisibility).mockResolvedValueOnce({
        data: { song: { ...mockSongs[0], isVisible: false } },
      });

      renderDashboard();
      const hideButtons = await screen.findAllByText("👁 Hide");
      fireEvent.click(hideButtons[0]);

      await waitFor(() => {
        expect(api.toggleVisibility).toHaveBeenCalledWith("1");
      });
    });

    it("shows Show button for hidden songs", async () => {
      vi.mocked(api.getAllSongs).mockResolvedValueOnce({ data: mockSongs });
      renderDashboard();
      expect(await screen.findByText("👁 Show")).toBeInTheDocument();
    });
  });
});
