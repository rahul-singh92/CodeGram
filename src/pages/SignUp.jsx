import { useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import "../styles/signup.css";

function Signup() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Sign Up • CodeGram";
  }, []);

  return (
    <div className="signup-wrapper">
      <div className="signup-box">

  {/* BACK BUTTON */}
  <button
    className="back-button"
    onClick={() => navigate("/")}
    aria-label="Back to login"
  >
    ←
  </button>

  {/* HEADER TEXT */}
  <h2 className="signup-title">Get Started in CodeGram</h2>

  <p className="signup-subtitle">
    Sign up to see photos from your friends
  </p>

  {/* EMAIL LABEL */}
  <p className="field-label">Email Address</p>
  <div className="input-group">
    <input type="email" id="email" required />
    <label htmlFor="email">Email</label>
  </div>

  <p className="field-label">Password</p>
  <div className="input-group">
    <input type="password" id="password" required />
    <label htmlFor="password">Password</label>
  </div>

  <p className="field-label">Birthday</p>

<div className="birthday-group">
  <select required>
    <option value="">Day</option>
    {Array.from({ length: 31 }, (_, i) => (
      <option key={i + 1} value={i + 1}>
        {i + 1}
      </option>
    ))}
  </select>

  <select required>
    <option value="">Month</option>
    {[
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ].map((month, index) => (
      <option key={index} value={index + 1}>
        {month}
      </option>
    ))}
  </select>

  <select required>
    <option value="">Year</option>
    {Array.from({ length: 100 }, (_, i) => {
      const year = new Date().getFullYear() - i;
      return (
        <option key={year} value={year}>
          {year}
        </option>
      );
    })}
  </select>
</div>


  <p className="field-label">Name</p>
  <div className="input-group">
    <input type="text" id="name" required />
    <label htmlFor="name">Full Name</label>
  </div>

  <p className="field-label">Username</p>
  <div className="input-group">
    <input type="text" id="username" required />
    <label htmlFor="username">Username</label>
  </div>

  <button className="signup-button">
    Submit
  </button>
</div>
    </div>
  );
}

export default Signup