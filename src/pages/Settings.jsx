import Sidebar from "../components/Sidebar";
import SettingsSidebar from "../components/SettingsSidebar";
import { Outlet } from "react-router-dom";
import "../styles/settings.css";

function Settings() {
  return (
    <div className="profile-page">
      <Sidebar />

      <main className="profile-content">
        <div className="settings-layout">
          <SettingsSidebar />

          <section className="settings-content">
            <Outlet />
          </section>
        </div>
      </main>
    </div>
  );
}

export default Settings;
