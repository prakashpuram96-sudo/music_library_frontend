import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePlayer } from "../context/PlayerContext";
import {
  logoutUser,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/api";
import { useState, useEffect, useRef } from "react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { stopPlayer } = usePlayer();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    if (user?.role === "user") {
      fetchNotifications();
      // Poll every 30 seconds for new notifications
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(
        notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error(error);
    } finally {
      stopPlayer();
      setShowLogoutModal(false);
      logout();
      navigate("/login");
    }
  };

  const isActive = (path) => location.pathname === path;

  const navLinkStyle = (path) => ({
    textDecoration: "none",
    color: isActive(path) ? "#fff" : "var(--text-muted)",
    fontSize: "0.9rem",
    fontWeight: "500",
    padding: "0.4rem 0.9rem",
    borderRadius: "50px",
    background: isActive(path) ? "rgba(255,255,255,0.12)" : "transparent",
    transition: "all 0.2s",
  });

  const BellIcon = () => (
    <div ref={notifRef} style={{ position: "relative" }}>
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        style={{
          background: showNotifications
            ? "rgba(108,61,211,0.3)"
            : "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "50%",
          color: "#fff",
          width: "36px",
          height: "36px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1rem",
          position: "relative",
          transition: "all 0.2s",
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              background: "#f43f8e",
              borderRadius: "50%",
              width: "18px",
              height: "18px",
              fontSize: "0.65rem",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #060818",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div
          style={{
            position: "absolute",
            top: "44px",
            right: 0,
            width: "320px",
            background: "rgba(10,6,28,0.97)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "16px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
            backdropFilter: "blur(20px)",
            zIndex: 300,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "1rem 1.2rem",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <p
              style={{
                fontFamily: "Syne, sans-serif",
                fontWeight: "700",
                fontSize: "0.95rem",
              }}
            >
              Notifications
              {unreadCount > 0 && (
                <span
                  style={{
                    marginLeft: "0.5rem",
                    background: "rgba(244,63,142,0.2)",
                    border: "1px solid rgba(244,63,142,0.3)",
                    borderRadius: "50px",
                    padding: "0.1rem 0.45rem",
                    fontSize: "0.7rem",
                    color: "#f43f8e",
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </p>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#a78bfa",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div style={{ maxHeight: "360px", overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2.5rem 1rem" }}>
                <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔔</p>
                <p className="text-secondary" style={{ fontSize: "0.85rem" }}>
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
                  style={{
                    padding: "0.85rem 1.2rem",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    background: notif.isRead
                      ? "transparent"
                      : "rgba(108,61,211,0.08)",
                    cursor: notif.isRead ? "default" : "pointer",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.75rem",
                    transition: "background 0.2s",
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "50%",
                      background: notif.isRead
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(108,61,211,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.9rem",
                      flexShrink: 0,
                    }}
                  >
                    🎵
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: notif.isRead ? "400" : "600",
                        color: notif.isRead ? "var(--text-muted)" : "#fff",
                        lineHeight: 1.4,
                        marginBottom: "0.25rem",
                      }}
                    >
                      {notif.message}
                    </p>
                    <p
                      style={{
                        fontSize: "0.72rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {new Date(notif.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {/* Unread dot */}
                  {!notif.isRead && (
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "#6c3dd3",
                        flexShrink: 0,
                        marginTop: "4px",
                      }}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <nav
        className="glass-nav"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          padding: "0.9rem 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        {/* Logo */}
        <Link to="/library" style={{ textDecoration: "none" }}>
          <span
            style={{
              fontFamily: "Syne, sans-serif",
              fontSize: "1.25rem",
              fontWeight: "800",
              letterSpacing: "-0.02em",
              color: "#fff",
            }}
          >
            ◈ MusicLib
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div style={{ display: "flex", gap: "0.3rem" }} className="desktop-nav">
          <Link to="/library" style={navLinkStyle("/library")}>
            Library
          </Link>
          <Link to="/playlists" style={navLinkStyle("/playlists")}>
            Playlists
          </Link>
          {user?.role === "admin" && (
            <Link to="/admin" style={navLinkStyle("/admin")}>
              Admin
            </Link>
          )}
        </div>

        {/* Desktop User Info + Bell + Logout */}
        <div
          style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          className="desktop-nav"
        >
          {/* Bell — only for users */}
          {user?.role === "user" && <BellIcon />}

          {/* Avatar */}
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6c3dd3, #0ea5e9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.85rem",
              fontWeight: "700",
              flexShrink: 0,
              boxShadow: "0 0 12px rgba(108,61,211,0.5)",
            }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </div>

          {/* Name + Role */}
          <div style={{ maxWidth: "120px" }}>
            <p
              style={{
                fontSize: "0.85rem",
                fontWeight: "600",
                lineHeight: 1.2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user?.name}
            </p>
            <span
              style={{
                fontSize: "0.65rem",
                fontWeight: "700",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "0.15rem 0.5rem",
                borderRadius: "50px",
                display: "inline-block",
                marginTop: "0.2rem",
                background:
                  user?.role === "admin"
                    ? "rgba(244,63,142,0.2)"
                    : "rgba(14,165,233,0.2)",
                border: `1px solid ${
                  user?.role === "admin"
                    ? "rgba(244,63,142,0.4)"
                    : "rgba(14,165,233,0.4)"
                }`,
                color: user?.role === "admin" ? "#f43f8e" : "#0ea5e9",
              }}
            >
              {user?.role}
            </span>
          </div>

          <button
            className="btn-danger"
            onClick={() => setShowLogoutModal(true)}
            style={{ padding: "0.5rem 1.2rem", fontSize: "0.85rem" }}
          >
            Logout
          </button>
        </div>

        {/* Mobile Right — Bell + Avatar + Hamburger */}
        <div
          style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}
          className="mobile-nav"
        >
          {user?.role === "user" && <BellIcon />}

          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6c3dd3, #0ea5e9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.8rem",
              fontWeight: "700",
              boxShadow: "0 0 10px rgba(108,61,211,0.5)",
            }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "10px",
              color: "#fff",
              width: "38px",
              height: "38px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "5px",
              padding: "8px",
            }}
          >
            <span
              style={{
                display: "block",
                width: "18px",
                height: "2px",
                background: "#fff",
                borderRadius: "2px",
                transition: "all 0.3s",
                transform: menuOpen
                  ? "rotate(45deg) translate(5px, 5px)"
                  : "none",
              }}
            />
            <span
              style={{
                display: "block",
                width: "18px",
                height: "2px",
                background: "#fff",
                borderRadius: "2px",
                transition: "all 0.3s",
                opacity: menuOpen ? 0 : 1,
              }}
            />
            <span
              style={{
                display: "block",
                width: "18px",
                height: "2px",
                background: "#fff",
                borderRadius: "2px",
                transition: "all 0.3s",
                transform: menuOpen
                  ? "rotate(-45deg) translate(5px, -5px)"
                  : "none",
              }}
            />
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div
          className="glass mobile-nav"
          style={{
            position: "fixed",
            top: "70px",
            left: "1rem",
            right: "1rem",
            zIndex: 99,
            padding: "1rem",
            borderRadius: "16px",
            boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
            flexDirection: "column",
          }}
        >
          {/* User Info */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              padding: "0.6rem 0.8rem",
              marginBottom: "0.75rem",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "12px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #6c3dd3, #0ea5e9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.8rem",
                fontWeight: "700",
                flexShrink: 0,
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <p style={{ fontSize: "0.88rem", fontWeight: "600" }}>
              {user?.name}
            </p>
            <span
              style={{
                fontSize: "0.62rem",
                fontWeight: "700",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "0.12rem 0.45rem",
                borderRadius: "50px",
                background:
                  user?.role === "admin"
                    ? "rgba(244,63,142,0.2)"
                    : "rgba(14,165,233,0.2)",
                border: `1px solid ${
                  user?.role === "admin"
                    ? "rgba(244,63,142,0.4)"
                    : "rgba(14,165,233,0.4)"
                }`,
                color: user?.role === "admin" ? "#f43f8e" : "#0ea5e9",
              }}
            >
              {user?.role}
            </span>
          </div>

          {/* Nav Links */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
              marginBottom: "0.75rem",
            }}
          >
            <Link
              to="/library"
              style={{
                textDecoration: "none",
                color: isActive("/library") ? "#fff" : "var(--text-muted)",
                fontSize: "0.95rem",
                fontWeight: "600",
                padding: "0.75rem 1rem",
                borderRadius: "12px",
                background: isActive("/library")
                  ? "rgba(255,255,255,0.12)"
                  : "transparent",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                transition: "all 0.2s",
              }}
              onClick={() => setMenuOpen(false)}
            >
              🎵 <span>Library</span>
            </Link>
            <Link
              to="/playlists"
              style={{
                textDecoration: "none",
                color: isActive("/playlists") ? "#fff" : "var(--text-muted)",
                fontSize: "0.95rem",
                fontWeight: "600",
                padding: "0.75rem 1rem",
                borderRadius: "12px",
                background: isActive("/playlists")
                  ? "rgba(255,255,255,0.12)"
                  : "transparent",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                transition: "all 0.2s",
              }}
              onClick={() => setMenuOpen(false)}
            >
              📋 <span>Playlists</span>
            </Link>
            {user?.role === "admin" && (
              <Link
                to="/admin"
                style={{
                  textDecoration: "none",
                  color: isActive("/admin") ? "#fff" : "var(--text-muted)",
                  fontSize: "0.95rem",
                  fontWeight: "600",
                  padding: "0.75rem 1rem",
                  borderRadius: "12px",
                  background: isActive("/admin")
                    ? "rgba(255,255,255,0.12)"
                    : "transparent",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  transition: "all 0.2s",
                }}
                onClick={() => setMenuOpen(false)}
              >
                ⚙️ <span>Admin</span>
              </Link>
            )}
          </div>

          {/* Divider */}
          <div
            style={{
              height: "1px",
              background: "rgba(255,255,255,0.08)",
              marginBottom: "0.75rem",
            }}
          />

          {/* Logout */}
          <button
            className="btn-danger"
            style={{ width: "100%", padding: "0.7rem", fontSize: "0.9rem" }}
            onClick={() => {
              setMenuOpen(false);
              setShowLogoutModal(true);
            }}
          >
            Logout
          </button>
        </div>
      )}

      {/* Logout Modal */}
      {showLogoutModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="glass fade-up"
            style={{
              padding: "2rem",
              maxWidth: "360px",
              width: "90%",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "rgba(244,63,142,0.15)",
                border: "1px solid rgba(244,63,142,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                margin: "0 auto 1.2rem",
              }}
            >
              👋
            </div>
            <h3
              style={{
                fontFamily: "Syne, sans-serif",
                fontSize: "1.2rem",
                fontWeight: "800",
                marginBottom: "0.5rem",
              }}
            >
              Leaving so soon?
            </h3>
            <p
              className="text-secondary"
              style={{ fontSize: "0.88rem", marginBottom: "1.8rem" }}
            >
              Are you sure you want to log out?
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                className="btn-secondary"
                style={{ flex: 1, padding: "0.7rem" }}
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-danger"
                style={{ flex: 1, padding: "0.7rem" }}
                onClick={handleLogout}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .desktop-nav { display: flex !important; }
        .mobile-nav { display: none !important; }

        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-nav { display: flex !important; }
        }
      `}</style>
    </>
  );
};

export default Navbar;
