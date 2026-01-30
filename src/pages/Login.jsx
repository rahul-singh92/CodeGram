import "../styles/login.css";
import editorPreview from "../assets/editor login preview.png";
import brandLogo from "../assets/brand logo.svg";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState(""); // username OR email
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const isFormValid = identifier.trim() !== "" && password.length >= 6;

  useEffect(() => {
    document.title = "Login • CodeGram";
  }, []);

  const handleLogin = async () => {
    if (!isFormValid) return;

    setLoading(true);

    let loginEmail = identifier;

    // If input does NOT look like an email, treat as username
    if (!identifier.includes("@")) {
      const { data, error } = await supabase
        .from("profiles")
        .select("email")
        .eq("username", identifier)
        .single();

      if (error || !data) {
        alert("Username not found");
        setLoading(false);
        return;
      }

      loginEmail = data.email;
    }

    const { error: authError } =
      await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

    if (authError) {
      alert("Invalid credentials");
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  return (
    <div className="login-wrapper">

      {/* Left Section */}
      <div className="login-left">
        <div className="brand-header">
          <img src={brandLogo} alt="Brand Logo" className="brand-icon" />
          <h1 className="brand-logo">
            <span className="brand-gradient">CodeGram</span>
          </h1>
        </div>

        <p className="brand-text">
          Share and Explore Coding with
          <br />
          your <span className="brand-highlight">Close Friends</span>
        </p>

        <div className="editor-preview">
          <img src={editorPreview} alt="VS Code Preview" />
        </div>
      </div>

      <div className="section-divider"></div>

      {/* Right Section */}
      <div className="login-right">
        <div className="login-box">
          <h2>Log into CodeGram</h2>

          <div className="input-group">
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
            <label>Username or Email</label>
          </div>

          <div className="input-group password-group">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label>Password</label>

            <button
              type="button"
              className="eye-button"
              onClick={() => setShowPassword(!showPassword)}
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </button>
          </div>

          <button
            className="login-button"
            onClick={handleLogin}
            disabled={!isFormValid || loading}
          >
            {loading ? "Logging In..." : "Log In"}
          </button>

          <div className="divider"></div>

          <button
            className="create-account"
            onClick={() => navigate("/signup")}
          >
            Create New Account
          </button>

          <div className="footer-brand">
            <img src={brandLogo} alt="Brand Logo" className="footer-brand-icon" />
            <span className="footer-logo">RSJ</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
