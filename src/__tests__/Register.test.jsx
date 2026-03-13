import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Register from "../pages/Register";

vi.mock("../services/api", () => ({
  registerUser: vi.fn(),
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

const renderRegister = () =>
  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );

describe("Register Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders the MusicLib heading", () => {
      renderRegister();
      expect(screen.getByText(/MusicLib/i)).toBeInTheDocument();
    });

    it("renders the Create your account subtitle", () => {
      renderRegister();
      expect(screen.getByText("Create your account")).toBeInTheDocument();
    });

    it("renders all four input fields", () => {
      renderRegister();
      expect(
        screen.getByPlaceholderText("Enter your full name")
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Enter your email")
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Enter your phone number")
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Create a password")
      ).toBeInTheDocument();
    });

    it("renders the Create Account button", () => {
      renderRegister();
      expect(
        screen.getByRole("button", { name: /create account/i })
      ).toBeInTheDocument();
    });

    it("renders a link to Sign In page", () => {
      renderRegister();
      expect(
        screen.getByRole("link", { name: /sign in/i })
      ).toBeInTheDocument();
    });

    it("does not show error message on initial render", () => {
      renderRegister();
      expect(screen.queryByText("Registration failed")).not.toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("updates name field on change", () => {
      renderRegister();
      const nameInput = screen.getByPlaceholderText("Enter your full name");
      fireEvent.change(nameInput, {
        target: { name: "name", value: "Nikhil" },
      });
      expect(nameInput.value).toBe("Nikhil");
    });

    it("updates email field on change", () => {
      renderRegister();
      const emailInput = screen.getByPlaceholderText("Enter your email");
      fireEvent.change(emailInput, {
        target: { name: "email", value: "nikhil@gmail.com" },
      });
      expect(emailInput.value).toBe("nikhil@gmail.com");
    });

    it("updates phone field on change", () => {
      renderRegister();
      const phoneInput = screen.getByPlaceholderText("Enter your phone number");
      fireEvent.change(phoneInput, {
        target: { name: "phone", value: "9999999999" },
      });
      expect(phoneInput.value).toBe("9999999999");
    });

    it("updates password field on change", () => {
      renderRegister();
      const passwordInput = screen.getByPlaceholderText("Create a password");
      fireEvent.change(passwordInput, {
        target: { name: "password", value: "secret123" },
      });
      expect(passwordInput.value).toBe("secret123");
    });
  });

  describe("API Calls", () => {
    const fillForm = () => {
      fireEvent.change(screen.getByPlaceholderText("Enter your full name"), {
        target: { name: "name", value: "Nikhil" },
      });
      fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
        target: { name: "email", value: "nikhil@gmail.com" },
      });
      fireEvent.change(screen.getByPlaceholderText("Enter your phone number"), {
        target: { name: "phone", value: "9999999999" },
      });
      fireEvent.change(screen.getByPlaceholderText("Create a password"), {
        target: { name: "password", value: "123456" },
      });
    };

    it("calls registerUser with correct data on submit", async () => {
      const { registerUser } = await import("../services/api");
      registerUser.mockResolvedValueOnce({
        data: { token: "abc123", role: "user", name: "Nikhil" },
      });

      renderRegister();
      fillForm();
      fireEvent.click(screen.getByRole("button", { name: /create account/i }));

      await waitFor(() => {
        expect(registerUser).toHaveBeenCalledWith({
          name: "Nikhil",
          email: "nikhil@gmail.com",
          phone: "9999999999",
          password: "123456",
        });
      });
    });

    it("navigates to /library on successful registration", async () => {
      const { registerUser } = await import("../services/api");
      registerUser.mockResolvedValueOnce({
        data: { token: "abc123", role: "user", name: "Nikhil" },
      });

      renderRegister();
      fillForm();
      fireEvent.click(screen.getByRole("button", { name: /create account/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/library");
      });
    });

    it("shows API error message on failed registration", async () => {
      const { registerUser } = await import("../services/api");
      registerUser.mockRejectedValueOnce({
        response: { data: { message: "Email already exists" } },
      });

      renderRegister();
      fillForm();
      fireEvent.click(screen.getByRole("button", { name: /create account/i }));

      expect(
        await screen.findByText("Email already exists")
      ).toBeInTheDocument();
    });

    it("shows fallback error when API returns no message", async () => {
      const { registerUser } = await import("../services/api");
      registerUser.mockRejectedValueOnce({});

      renderRegister();
      fillForm();
      fireEvent.click(screen.getByRole("button", { name: /create account/i }));

      expect(
        await screen.findByText("Registration failed")
      ).toBeInTheDocument();
    });

    it("shows loading state while creating account", async () => {
      const { registerUser } = await import("../services/api");
      registerUser.mockImplementationOnce(() => new Promise(() => {}));

      renderRegister();
      fillForm();
      fireEvent.click(screen.getByRole("button", { name: /create account/i }));

      expect(
        await screen.findByText("Creating Account...")
      ).toBeInTheDocument();
    });

    it("disables button while loading", async () => {
      const { registerUser } = await import("../services/api");
      registerUser.mockImplementationOnce(() => new Promise(() => {}));

      renderRegister();
      fillForm();
      fireEvent.click(screen.getByRole("button", { name: /create account/i }));

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /creating account/i })
        ).toBeDisabled();
      });
    });
  });
});
