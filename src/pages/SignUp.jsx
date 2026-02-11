import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "../styles/signup.css";

function Signup() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState("");

  // Validation for if user touched the input or not
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(false);

  const emailError = emailTouched && (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  const passwordError = passwordTouched && password.length < 6;

  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameError("");
      return;
    }

    if (!usernameTouched) return;

    const timeout = setTimeout(async () => {
      setCheckingUsername(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .limit(1);

      if (!error && data.length > 0) {
        setUsernameError("Username already taken");
      }
      else {
        setUsernameError("");
        setUsernameAvailable(true);
      }

      setCheckingUsername(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, [username, usernameTouched]);

  useEffect(() => {
    document.title = "Sign Up • CodeGram";

    const detectCountry = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        setCountry(data.country_name);
      } catch (err) {
        console.warn("Could not detect country");
      }
    };

    detectCountry();
  }, []);



  const handleSignup = async () => {
    if (usernameError) {
      setUsernameTouched(true);
      return;
    }
    if (emailError || passwordError) {
      setEmailTouched(true);
      setPasswordTouched(true);
      return;
    }
    if (
      !email ||
      password.length < 6 ||
      !day ||
      !month ||
      !year ||
      !fullName ||
      !username
    ) {
      alert("Please fill all fields correctly");
      return;
    }

    if (username.includes(" ")) {
      alert("Username cannot contain spaces");
      return;
    }

    setLoading(true);

    const dob = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "http://localhost:3000",
      },
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const user = data.user;

    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.id,
      email,
      username,
      full_name: fullName,
      date_of_birth: dob,
      country,
    });

    if (profileError) {
      alert(profileError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    navigate("/profile");
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-box">

        <button className="back-button" onClick={() => navigate("/")}>
          ←
        </button>

        <h2 className="signup-title">Get Started in CodeGram</h2>
        <p className="signup-subtitle">
          Sign up to see photos from your friends
        </p>

        <p className="field-label">Email Address</p>
        <div className={`input-group ${emailError ? "error" : ""}`}>
          <input
            type="text"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setEmailTouched(true)}
          />
          <label className={email ? "filled" : ""}>Email</label>
        </div>

        {emailError && (
          <p className="input-error">* Enter a valid email address</p>
        )}

        <p className="field-label">Password</p>
        <div className={`input-group ${passwordError ? "error" : ""}`}>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setPasswordTouched(true)}
          />
          <label className={password ? "filled" : ""}>Password</label>
        </div>

        {passwordError &&
          <p className="input-error">* Password must be at least 6 characters</p>
        }
        <p className="field-label">Birthday</p>
        <div className="birthday-group">
          <select value={day} onChange={(e) => setDay(e.target.value)}>
            <option value="">Day</option>
            {Array.from({ length: 31 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>

          <select value={month} onChange={(e) => setMonth(e.target.value)}>
            <option value="">Month</option>
            {[
              "January", "February", "March", "April", "May", "June",
              "July", "August", "September", "October", "November", "December"
            ].map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>

          <select value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="">Year</option>
            {Array.from({ length: 100 }, (_, i) => {
              const y = new Date().getFullYear() - i;
              return <option key={y} value={y}>{y}</option>;
            })}
          </select>
        </div>

        <p className="field-label">Name</p>
        <div className="input-group">
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <label>Full Name</label>
        </div>

        <p className="field-label">Username</p>
        <div className={`input-group ${usernameError ? "error" : ""}`}>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onBlur={() => setUsernameTouched(true)}
          />
          <label className={username ? "filled" : ""}>Username</label>
        </div>

        {checkingUsername && (
          <p className="input-hint">Checking availability...</p>
        )}

        {usernameError && (
          <p className="input-error">* {usernameError}</p>
        )}

        {usernameAvailable && !usernameError && (
          <p className="input-success">✓ Username is available</p>
        )}

        <button
          className="signup-button"
          onClick={handleSignup}
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>
      </div>
    </div>
  );
}

export default Signup;
