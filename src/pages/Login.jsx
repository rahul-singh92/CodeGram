import "../styles/login.css";
import editorPreview from "../assets/editor login preview.png";
import brandLogo from "../assets/brand logo.svg";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

function Login()
{
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    //Validation Condition
    const isFormValid = email.trim() !== "" && password.length >= 6;

    useEffect(() => {
        document.title = "Login • CodeGram"
    }, []);

    return(
        <div className="login-wrapper">

            { /* Left Section*/ }
            <div className="login-left">
                <div className="brand-header">
                    <img src={brandLogo} alt="Brand Logo" className="brand-icon"/>
                    <h1 className="brand-logo">
                        <span className="brand-gradient">CodeGram</span>
                    </h1>
                </div>

                <p className="brand-text">Share and Explore Coding with 
                    <br />
                    your <span className="brand-highlight">Close Friends</span>
                </p>

                <div className="editor-preview">
                    <img src={editorPreview} alt="VS Code Preview"/>
                </div>
            </div>
            <div className="section-divider"></div>
            {/* Right Section */}
            <div className="login-right">
                <div className="login-box">
                    <h2>Log into CodeGram</h2>

                    <div className="input-group">
                        <input type="text" id="email" required value={email} onChange={(e) => setEmail(e.target.value)}/>
                        <label htmlFor="email">Username or Email</label>
                    </div>

                    <div className="input-group password-group">
                        <input type={showPassword ? "text" : "password"} id="password" required value={password} onChange={(e) => setPassword(e.target.value)}/>
                        <label htmlFor="password">Password</label>
                        <button type="button" className="eye-button" onClick={() => setShowPassword(!showPassword)}>
                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                        </button>
                    </div>

                    <button className="login-button" disabled={!isFormValid}>
                        Log In
                    </button>

                    <div className="divider"></div>

                    <button className="create-account" onClick={() => navigate("/signup")}>Create New Account</button>

                    <div className="footer-brand">
                        <img src={brandLogo} alt="Brand Logo" className="footer-brand-icon"/>
                        <span className="footer-logo">RSJ</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login;