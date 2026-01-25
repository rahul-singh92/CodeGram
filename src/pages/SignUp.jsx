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

  useEffect(() => {
    document.title = "CodeGram • Sign Up";
  }, []);

  const handleSignup = async () => {
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
    });

    if (profileError) {
      alert(profileError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    navigate("/feed");
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
        <div className="input-group">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label>Email</label>
        </div>

        <p className="field-label">Password</p>
        <div className="input-group">
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label>Password</label>
        </div>

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
              "January","February","March","April","May","June",
              "July","August","September","October","November","December"
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
        <div className="input-group">
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <label>Username</label>
        </div>

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
