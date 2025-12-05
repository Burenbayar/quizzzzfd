import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8000";

export default function Header() {
  const navigate = useNavigate();

  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState("login"); // "login" | "register"
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form
  const [regEmail, setRegEmail] = useState("");
  const [regName, setRegName] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  // Нэвтэрсэн хэрэглэгч
  const [authUser, setAuthUser] = useState(null); // { email, token }

  // Page ачаалах үед localStorage-с auth уншина
  useEffect(() => {
    const saved = localStorage.getItem("auth");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.token && parsed.email) {
          setAuthUser(parsed);
        }
      } catch (e) {
        console.error("Invalid auth in localStorage", e);
      }
    }
  }, []);

  function openAuthModal(tab = "login") {
    setActiveTab(tab);
    setAuthError("");
    setAuthSuccess("");
    setShowAuth(true);
  }

  function closeAuthModal() {
    setShowAuth(false);
    setAuthError("");
    setAuthSuccess("");
  }

  function handleLogout() {
    localStorage.removeItem("auth");
    setAuthUser(null);
    setIsMenuOpen(false);
  }

  // ---------------- LOGIN ----------------
  async function handleLoginSubmit(e) {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    setAuthLoading(true);

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Нэвтрэхэд алдаа гарлаа.");
      }

      const data = await res.json(); // {access_token, token_type}

      const authInfo = {
        email: loginEmail,
        token: data.access_token,
      };

      localStorage.setItem("auth", JSON.stringify(authInfo));
      setAuthUser(authInfo);
      setAuthSuccess("Амжилттай нэвтэрлээ!");
      setShowAuth(false);
      setLoginPassword("");
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  }

  // ---------------- REGISTER ----------------
  async function handleRegisterSubmit(e) {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    setAuthLoading(true);

    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: regEmail,
          name: regName,
          password: regPassword,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Бүртгүүлэхэд алдаа гарлаа.");
      }

      const data = await res.json(); // { id, email, name }

      setAuthSuccess("Амжилттай бүртгэгдлээ! Одоо нэвтрэнэ үү.");
      setActiveTab("login");
      setLoginEmail(data.email);
      setRegPassword("");
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  }

  function handleNavClick(path) {
    navigate(path);
    setIsMenuOpen(false);
  }

  function handleGoProfile() {
    navigate("/profile");
    setIsMenuOpen(false);
  }

  return (
    <>
      <header className="header">
        <button
          className={`burger-btn ${isMenuOpen ? "open" : ""}`}
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
        >
          <span className="burger-line" />
          <span className="burger-line" />
          <span className="burger-line" />
        </button>

        {/* NAVIGATION WRAPPER – burger-тай хамт ажиллана */}
        <div
          className={`nav-wrapper ${isMenuOpen ? "nav-wrapper-open" : ""}`}
        >
          <ul className="nav-list">
            <li>
              <button
                className="nav-btn"
                onClick={() => handleNavClick("/")}
              >
                Нүүр
              </button>
            </li>
            <li>
              <button
                className="nav-btn"
                onClick={() => handleNavClick("/teams")}
              >
                Манай баг
              </button>
            </li>
            <li>
              <button
                className="nav-btn quiz-btn"
                onClick={() => handleNavClick("/quiz")}
              >
                Тестүүд
              </button>
            </li>
          </ul>
        </div>

        {/* AUTH хэсэг – үргэлж баруун талд */}
        <div className="auth-container">
          {authUser ? (
            <>
              {/* Avatar */}
              <button
                className="avatar-btn"
                onClick={handleGoProfile}
                title={authUser.email}
              >
                {authUser.email.charAt(0).toUpperCase()}
              </button>

              {/* Desktop logout (text) */}
              <button
                className="nav-btn login-btn logout-btn-text"
                onClick={handleLogout}
              >
                Гарах
              </button>

              {/* Mobile logout (icon) */}
              <button
                className="logout-btn-icon"
                onClick={handleLogout}
                title="Гарах"
              >
                ➜]
              </button>
            </>
          ) : (
            <>
              <button
                className="nav-btn login-btn"
                onClick={() => openAuthModal("login")}
              >
                Нэвтрэх
              </button>
            </>
          )}

        </div>

        {/* Burger товч – зөвхөн mobile/tablet дээр харагдана (CSS дээрээ хянана) */}

      </header>



      {/* AUTH MODAL */}
      {showAuth && (
        <div className="modal-overlay">
          <div className="modal-box">
            <span className="close-btn" onClick={closeAuthModal}>
              &times;
            </span>

            {authError && (
              <div
                style={{
                  color: "#f97373",
                  fontSize: 13,
                  marginBottom: 8,
                }}
              >
                {authError}
              </div>
            )}

            {authSuccess && (
              <div
                style={{
                  color: "#4ade80",
                  fontSize: 13,
                  marginBottom: 8,
                }}
              >
                {authSuccess}
              </div>
            )}

            {activeTab === "login" ? (
              <>
                <h3 style={{ marginBottom: 10 }}>Нэвтрэх</h3>
                <form className="auth-form" onSubmit={handleLoginSubmit}>
                  <label>Имэйл</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                  />

                  <label>Нууц үг</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                  />

                  <button type="submit" disabled={authLoading}>
                    {authLoading ? "Түр хүлээнэ үү..." : "Нэвтрэх"}
                  </button>
                </form>

                <p
                  style={{
                    marginTop: 10,
                    fontSize: 13,
                    textAlign: "center",
                    color: "#9ca3af",
                  }}
                >
                  Бүртгэлгүй юу?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("register");
                      setAuthError("");
                      setAuthSuccess("");
                    }}
                    style={{
                      border: "none",
                      background: "none",
                      color: "#f472b6",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Бүртгүүлэх
                  </button>
                </p>
              </>
            ) : (
              <>
                <h3 style={{ marginBottom: 10 }}>Бүртгүүлэх</h3>
                <form className="auth-form" onSubmit={handleRegisterSubmit}>
                  <label>Нэр</label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                    placeholder="Таны нэр"
                  />

                  <label>Имэйл</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                  />

                  <label>Нууц үг</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                  />

                  <button type="submit" disabled={authLoading}>
                    {authLoading ? "Түр хүлээнэ үү..." : "Бүртгүүлэх"}
                  </button>
                </form>

                <p
                  style={{
                    marginTop: 10,
                    fontSize: 13,
                    textAlign: "center",
                    color: "#9ca3af",
                  }}
                >
                  Аль хэдийн бүртгэлтэй юу?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("login");
                      setAuthError("");
                      setAuthSuccess("");
                    }}
                    style={{
                      border: "none",
                      background: "none",
                      color: "#a5b4fc",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Нэвтрэх
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
