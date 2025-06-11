
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as Components from "./Components";
import { FaUserGraduate, FaChalkboardTeacher, FaLock, FaUserShield, FaGlobe } from "react-icons/fa";
import { useLanguage } from "./contexts/LanguageContext";

function LoginForm() {
  const navigate = useNavigate();
  const { language, toggleLanguage, t } = useLanguage();
  const [signIn, setSignIn] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.classList.remove("rtl");
    document.body.dir = "ltr";
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("https://192.168.1.6:7069/api/account/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data));

        if (data.userType === "Student") navigate("/student-dashboard");
        else if (data.userType === "Doctor") navigate("/doctor-dashboard");
        else if (data.userType === "Admin") navigate("/admin-dashboard");
      } else {
        setError(data?.message || t("Invalid credentials. Please try again."));
      }
    } catch {
      setError("❌ Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Components.GlobalStyle />

      <div className="language-toggle">
        <button className="language-btn" onClick={toggleLanguage}>
          <FaGlobe style={{ marginInlineEnd: 8 }} />
          {language === "english" ? "العربية" : "English"}
        </button>
      </div>

      <div className="university-logo">
        <h1>{t("Akhbar El-Youm Academy")}</h1>
      </div>

      <Components.Container>
        <Components.SignUpContainer signinIn={signIn === "doctor"}>
          <Components.Form onSubmit={handleSubmit}>
            <Components.Title>{t("Doctor Login")}</Components.Title>
            <Components.InputGroup>
              <Components.InputIcon><FaChalkboardTeacher /></Components.InputIcon>
              <Components.Input type="email" placeholder={t("Email")} value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Components.InputGroup>
            <Components.InputGroup>
              <Components.InputIcon><FaLock /></Components.InputIcon>
              <Components.Input type="password" placeholder={t("Password")} value={password} onChange={(e) => setPassword(e.target.value)} required />
            </Components.InputGroup>
            {error && <Components.ErrorMessage>{error}</Components.ErrorMessage>}
            <Components.Button disabled={loading}>{loading ? t("Signing In...") : t("Sign In")}</Components.Button>
          </Components.Form>
        </Components.SignUpContainer>

        <Components.SignInContainer signinIn={signIn === "student"}>
          <Components.Form onSubmit={handleSubmit}>
            <Components.Title>{t("Student Login")}</Components.Title>
            <Components.InputGroup>
              <Components.InputIcon><FaUserGraduate /></Components.InputIcon>
              <Components.Input type="email" placeholder={t("Email")} value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Components.InputGroup>
            <Components.InputGroup>
              <Components.InputIcon><FaLock /></Components.InputIcon>
              <Components.Input type="password" placeholder={t("Password")} value={password} onChange={(e) => setPassword(e.target.value)} required />
            </Components.InputGroup>
            {error && <Components.ErrorMessage>{error}</Components.ErrorMessage>}
            <Components.Button disabled={loading}>{loading ? t("Signing In...") : t("Sign In")}</Components.Button>
          </Components.Form>
        </Components.SignInContainer>

        <Components.SignUpContainer signinIn={signIn === "admin"}>
          <Components.Form onSubmit={handleSubmit}>
            <Components.Title>{t("Admin Login")}</Components.Title>
            <Components.InputGroup>
              <Components.InputIcon><FaUserShield /></Components.InputIcon>
              <Components.Input type="email" placeholder={t("Email")} value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Components.InputGroup>
            <Components.InputGroup>
              <Components.InputIcon><FaLock /></Components.InputIcon>
              <Components.Input type="password" placeholder={t("Password")} value={password} onChange={(e) => setPassword(e.target.value)} required />
            </Components.InputGroup>
            {error && <Components.ErrorMessage>{error}</Components.ErrorMessage>}
            <Components.Button disabled={loading}>{loading ? t("Signing In...") : t("Sign In")}</Components.Button>
          </Components.Form>
        </Components.SignUpContainer>

        <Components.OverlayContainer signinIn={signIn}>
          <Components.Overlay signinIn={signIn}>
            <Components.LeftOverlayPanel signinIn={signIn}>
              <Components.Title inOverlay>{t("Welcome to Akhbar El-Youm")}</Components.Title>
              <Components.Paragraph>{t("Switch to another role")}</Components.Paragraph>
              <Components.GhostButton onClick={() => setSignIn("student")}>{t("Student")}</Components.GhostButton>
              <Components.GhostButton onClick={() => setSignIn("doctor")}>{t("Doctor")}</Components.GhostButton>
              <Components.GhostButton onClick={() => setSignIn("admin")}>{t("Admin")}</Components.GhostButton>
            </Components.LeftOverlayPanel>

            <Components.RightOverlayPanel signinIn={signIn}>
              <Components.Title inOverlay>{t("Welcome to Akhbar El-Youm")}</Components.Title>
              <Components.Paragraph>{t("Sign in with your credentials")}</Components.Paragraph>
            </Components.RightOverlayPanel>
          </Components.Overlay>
        </Components.OverlayContainer>
      </Components.Container>

      <div className="login-footer">
        <p>
          © 2025 {t("Akhbar El-Youm Academy")}. {t("All rights reserved")}.
        </p>
      </div>
    </div>
  );
}

export default LoginForm;
