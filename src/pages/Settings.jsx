import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/settings.css";

function Settings() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "CodeGram • Settings";
  }, []);

  return (
    <div className="settings-page">
      <button className="back-button" onClick={() => navigate(-1)}>
        ←
      </button>

      <h1>Settings & Privacy</h1>

      <p>
        This is the settings page.  
        More options like privacy, security, account info will come here.
      </p>
    </div>
  );
}

export default Settings;
