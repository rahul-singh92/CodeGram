import { NavLink } from "react-router-dom";
import { User } from "lucide-react";

function SettingsSidebar() {
  return (
    <aside className="settings-sidebar">
      {/* Settings header */}
      <h3 className="settings-header">Settings</h3>

      {/* Group title */}
      <p className="settings-group-title">How you use CodeGram</p>

      {/* Item */}
      <NavLink
        to="/settings"
        end
        className={({ isActive }) =>
          `settings-item ${isActive ? "active" : ""}`
        }
      >
        <User className="settings-icon" size={18} strokeWidth={1.5} />
        <span>Edit Profile</span>
      </NavLink>
    </aside>
  );
}

export default SettingsSidebar;
