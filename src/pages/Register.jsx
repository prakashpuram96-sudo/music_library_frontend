import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { registerUser } from "../services/api";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await registerUser(formData);
      login(data);
      navigate("/library");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        className="glass"
        style={{ width: "100%", maxWidth: "420px", padding: "40px" }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "700",
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "8px",
            }}
          >
            🎵 MusicLib
          </h1>
          <p className="text-secondary">Create your account</p>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              background: "rgba(245, 87, 108, 0.2)",
              border: "1px solid rgba(245, 87, 108, 0.4)",
              borderRadius: "10px",
              padding: "12px",
              marginBottom: "20px",
              color: "#f5576c",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label
              style={{
                fontSize: "13px",
                color: "rgba(255,255,255,0.7)",
                marginBottom: "8px",
                display: "block",
              }}
            >
              Full Name
            </label>
            <input
              className="glass-input"
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label
              style={{
                fontSize: "13px",
                color: "rgba(255,255,255,0.7)",
                marginBottom: "8px",
                display: "block",
              }}
            >
              Email
            </label>
            <input
              className="glass-input"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label
              style={{
                fontSize: "13px",
                color: "rgba(255,255,255,0.7)",
                marginBottom: "8px",
                display: "block",
              }}
            >
              Phone Number
            </label>
            <input
              className="glass-input"
              type="tel"
              name="phone"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div>
            <label
              style={{
                fontSize: "13px",
                color: "rgba(255,255,255,0.7)",
                marginBottom: "8px",
                display: "block",
              }}
            >
              Password
            </label>
            <input
              className="glass-input"
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              fontSize: "16px",
              marginTop: "8px",
            }}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </div>

        {/* Footer */}
        <p
          style={{
            textAlign: "center",
            marginTop: "24px",
            color: "rgba(255,255,255,0.6)",
            fontSize: "14px",
          }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              color: "#667eea",
              textDecoration: "none",
              fontWeight: "600",
            }}
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
