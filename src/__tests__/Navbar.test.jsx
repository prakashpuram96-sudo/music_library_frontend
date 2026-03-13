import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import * as api from "../services/api";
import Navbar from "../components/Navbar";

vi.mock("../services/api", () => ({
  logoutUser: vi.fn(),
  getNotifications: vi.fn(),
  markNotificationAsRead: vi.fn(),
  markAllNotificationsAsRead: vi.fn(),
}));

const mockLogout = vi.fn();
const mockStopPlayer = vi.fn();
const mockNavigate = vi.fn();

vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../context/PlayerContext", () => ({
  usePlayer: () => ({ stopPlayer: mockStopPlayer }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockNotifications = [
  {
    _id: "n1",
    message: "New song added: Blinding Lights",
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "n2",
    message: "New song added: Starlight",
    isRead: true,
    createdAt: new Date().toISOString(),
  },
];

const renderNavbar = (path = "/library") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Navbar />
    </MemoryRouter>
  );

const setupUser = async (role = "user") => {
  const { useAuth } = await import("../context/AuthContext");
  vi.mocked(useAuth).mockReturnValue({
    user: { name: "Nikhil", role },
    logout: mockLogout,
  });
};

describe("Navbar Component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await setupUser("user");
    vi.mocked(api.getNotifications).mockResolvedValue({
      data: { notifications: [], unreadCount: 0 },
    });
  });

  describe("Rendering", () => {
    it("renders the logo", () => {
      renderNavbar();
      expect(screen.getAllByText("◈ MusicLib")[0]).toBeInTheDocument();
    });

    it("renders user name", () => {
      renderNavbar();
      expect(screen.getAllByText("Nikhil")[0]).toBeInTheDocument();
    });

    it("renders user role badge", () => {
      renderNavbar();
      expect(screen.getAllByText("user")[0]).toBeInTheDocument();
    });

    it("renders Library and Playlists nav links", () => {
      renderNavbar();
      expect(screen.getAllByText("Library")[0]).toBeInTheDocument();
      expect(screen.getAllByText("Playlists")[0]).toBeInTheDocument();
    });

    it("does not render Admin link for regular users", () => {
      renderNavbar();
      expect(screen.queryByText("Admin")).not.toBeInTheDocument();
    });

    it("renders Admin link for admin users", async () => {
      await setupUser("admin");
      vi.mocked(api.getNotifications).mockResolvedValue({
        data: { notifications: [], unreadCount: 0 },
      });
      renderNavbar();
      expect(screen.getAllByText("Admin")[0]).toBeInTheDocument();
    });

    it("renders Logout button", () => {
      renderNavbar();
      expect(
        screen.getAllByRole("button", { name: /Logout/i })[0]
      ).toBeInTheDocument();
    });

    it("renders bell icon for user role", () => {
      renderNavbar();
      expect(screen.getAllByText("🔔")[0]).toBeInTheDocument();
    });

    it("does not render bell icon for admin", async () => {
      await setupUser("admin");
      renderNavbar();
      expect(screen.queryByText("🔔")).not.toBeInTheDocument();
    });
  });

  describe("Logout Modal", () => {
    it("shows logout modal when Logout is clicked", () => {
      renderNavbar();
      fireEvent.click(screen.getAllByRole("button", { name: /^Logout$/i })[0]);
      expect(screen.getByText("Leaving so soon?")).toBeInTheDocument();
    });

    it("closes modal when Cancel is clicked", () => {
      renderNavbar();
      fireEvent.click(screen.getAllByRole("button", { name: /^Logout$/i })[0]);
      fireEvent.click(screen.getByRole("button", { name: /^Cancel$/i }));
      expect(screen.queryByText("Leaving so soon?")).not.toBeInTheDocument();
    });

    it("calls logout, stopPlayer and navigates on confirm", async () => {
      vi.mocked(api.logoutUser).mockResolvedValueOnce({});
      renderNavbar();
      fireEvent.click(screen.getAllByRole("button", { name: /^Logout$/i })[0]);
      fireEvent.click(screen.getByRole("button", { name: /Yes, Logout/i }));

      await waitFor(() => {
        expect(mockStopPlayer).toHaveBeenCalled();
        expect(mockLogout).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith("/login");
      });
    });
  });

  describe("Notifications", () => {
    it("shows unread count badge when unread notifications exist", async () => {
      vi.mocked(api.getNotifications).mockResolvedValue({
        data: { notifications: mockNotifications, unreadCount: 1 },
      });
      renderNavbar();
      expect(await screen.findAllByText("1")).toBeTruthy();
    });

    it("opens notification dropdown when bell is clicked", async () => {
      vi.mocked(api.getNotifications).mockResolvedValue({
        data: { notifications: mockNotifications, unreadCount: 1 },
      });
      renderNavbar();
      await screen.findAllByText("1");
      fireEvent.click(screen.getAllByText("🔔")[0]);
      expect(screen.getAllByText("Notifications")[0]).toBeInTheDocument();
    });

    it("shows notification messages in dropdown", async () => {
      vi.mocked(api.getNotifications).mockResolvedValue({
        data: { notifications: mockNotifications, unreadCount: 1 },
      });
      renderNavbar();
      fireEvent.click(screen.getAllByText("🔔")[0]);
      const msgs = await screen.findAllByText(
        "New song added: Blinding Lights"
      );
      expect(msgs[0]).toBeInTheDocument();
    });

    it("shows empty state when no notifications", async () => {
      renderNavbar();
      await waitFor(() => expect(api.getNotifications).toHaveBeenCalled());
      fireEvent.click(screen.getAllByText("🔔")[0]);
      expect(
        screen.getAllByText("No notifications yet")[0]
      ).toBeInTheDocument();
    });

    it("shows Mark all read button when unread notifications exist", async () => {
      vi.mocked(api.getNotifications).mockResolvedValue({
        data: { notifications: mockNotifications, unreadCount: 1 },
      });
      renderNavbar();
      await screen.findAllByText("1");
      fireEvent.click(screen.getAllByText("🔔")[0]);
      const btns = await screen.findAllByRole("button", {
        name: /Mark all read/i,
      });
      expect(btns[0]).toBeInTheDocument();
    });

    it("calls markAllNotificationsAsRead when Mark all read clicked", async () => {
      vi.mocked(api.getNotifications).mockResolvedValue({
        data: { notifications: mockNotifications, unreadCount: 1 },
      });
      vi.mocked(api.markAllNotificationsAsRead).mockResolvedValueOnce({});

      renderNavbar();
      await screen.findAllByText("1");
      fireEvent.click(screen.getAllByText("🔔")[0]);
      const btns = await screen.findAllByRole("button", {
        name: /Mark all read/i,
      });
      fireEvent.click(btns[0]);

      await waitFor(() => {
        expect(api.markAllNotificationsAsRead).toHaveBeenCalled();
      });
    });

    it("calls markNotificationAsRead when unread notification is clicked", async () => {
      vi.mocked(api.getNotifications).mockResolvedValue({
        data: { notifications: mockNotifications, unreadCount: 1 },
      });
      vi.mocked(api.markNotificationAsRead).mockResolvedValueOnce({});

      renderNavbar();
      fireEvent.click(screen.getAllByText("🔔")[0]);
      const msgs = await screen.findAllByText(
        "New song added: Blinding Lights"
      );
      fireEvent.click(msgs[0]);

      await waitFor(() => {
        expect(api.markNotificationAsRead).toHaveBeenCalledWith("n1");
      });
    });
  });

  describe("Mobile Hamburger Menu", () => {
    it("opens mobile menu when hamburger is clicked", () => {
      renderNavbar();
      const hamburger = screen
        .getAllByRole("button")
        .find((btn) => btn.querySelector("span[style*='width: 18px']"));
      fireEvent.click(hamburger);
      const mobileMenu = document.querySelector(".glass.mobile-nav");
      expect(mobileMenu).toBeInTheDocument();
    });
  });
});
