import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Login from "../pages/Login";

vi.mock("../services/api", () => ({
  loginUser: vi.fn(),
}));

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    login: vi.fn(),
  }),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderLogin = () =>
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

describe("Login Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders the MusicLib heading", () => {
      renderLogin();
      expect(screen.getByText(/MusicLib/i)).toBeInTheDocument();
    });

    it("renders email and password inputs", () => {
      renderLogin();
      expect(
        screen.getByPlaceholderText("Enter your email")
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Enter your password")
      ).toBeInTheDocument();
    });

    it("renders the Sign In button", () => {
      renderLogin();
      expect(
        screen.getByRole("button", { name: /sign in/i })
      ).toBeInTheDocument();
    });

    it("renders a link to Register page", () => {
      renderLogin();
      expect(
        screen.getByRole("link", { name: /register/i })
      ).toBeInTheDocument();
    });

    it("does not show error message on initial render", () => {
      renderLogin();
      expect(
        screen.queryByText("Please fill in all fields")
      ).not.toBeInTheDocument();
    });
  });

  describe("Validation", () => {
    it("shows error when submitting with empty fields", async () => {
      renderLogin();
      fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
      expect(
        await screen.findByText("Please fill in all fields")
      ).toBeInTheDocument();
    });

    it("shows error when email is missing", async () => {
      renderLogin();
      fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
        target: { name: "password", value: "password123" },
      });
      fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
      expect(
        await screen.findByText("Please fill in all fields")
      ).toBeInTheDocument();
    });

    it("shows error when password is missing", async () => {
      renderLogin();
      fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
        target: { name: "email", value: "test@example.com" },
      });
      fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
      expect(
        await screen.findByText("Please fill in all fields")
      ).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("updates email field on change", () => {
      renderLogin();
      const emailInput = screen.getByPlaceholderText("Enter your email");
      fireEvent.change(emailInput, {
        target: { name: "email", value: "test@example.com" },
      });
      expect(emailInput.value).toBe("test@example.com");
    });

    it("updates password field on change", () => {
      renderLogin();
      const passwordInput = screen.getByPlaceholderText("Enter your password");
      fireEvent.change(passwordInput, {
        target: { name: "password", value: "secret123" },
      });
      expect(passwordInput.value).toBe("secret123");
    });
  });

  describe("API Calls", () => {
    it("calls loginUser with correct credentials on submit", async () => {
      const { loginUser } = await import("../services/api");
      loginUser.mockResolvedValueOnce({
        data: { token: "abc123", role: "user", name: "Nikhil" },
      });

      renderLogin();
      fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
        target: { name: "email", value: "nikhil@gmail.com" },
      });
      fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
        target: { name: "password", value: "123456" },
      });
      fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(loginUser).toHaveBeenCalledWith({
          email: "nikhil@gmail.com",
          password: "123456",
        });
      });
    });

    it("navigates to /library on successful login", async () => {
      const { loginUser } = await import("../services/api");
      loginUser.mockResolvedValueOnce({
        data: { token: "abc123", role: "user", name: "Nikhil" },
      });

      renderLogin();
      fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
        target: { name: "email", value: "nikhil@gmail.com" },
      });
      fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
        target: { name: "password", value: "123456" },
      });
      fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/library");
      });
    });

    it("shows API error message on failed login", async () => {
      const { loginUser } = await import("../services/api");
      loginUser.mockRejectedValueOnce({
        response: { data: { message: "Invalid credentials" } },
      });

      renderLogin();
      fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
        target: { name: "email", value: "wrong@gmail.com" },
      });
      fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
        target: { name: "password", value: "wrongpass" },
      });
      fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

      expect(
        await screen.findByText("Invalid credentials")
      ).toBeInTheDocument();
    });

    it("shows fallback error when API returns no message", async () => {
      const { loginUser } = await import("../services/api");
      loginUser.mockRejectedValueOnce({});

      renderLogin();
      fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
        target: { name: "email", value: "test@gmail.com" },
      });
      fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
        target: { name: "password", value: "pass123" },
      });
      fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

      expect(await screen.findByText("Login failed")).toBeInTheDocument();
    });

    it("shows loading state while signing in", async () => {
      const { loginUser } = await import("../services/api");
      loginUser.mockImplementationOnce(() => new Promise(() => {})); // never resolves

      renderLogin();
      fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
        target: { name: "email", value: "nikhil@gmail.com" },
      });
      fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
        target: { name: "password", value: "123456" },
      });
      fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

      expect(await screen.findByText("Signing in...")).toBeInTheDocument();
    });

    it("disables button while loading", async () => {
      const { loginUser } = await import("../services/api");
      loginUser.mockImplementationOnce(() => new Promise(() => {}));

      renderLogin();
      fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
        target: { name: "email", value: "nikhil@gmail.com" },
      });
      fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
        target: { name: "password", value: "123456" },
      });
      fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /signing in/i })
        ).toBeDisabled();
      });
    });
  });
});
