import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useUser } from "../context/UserContext";

import {
  faHouse,
  faImage,
  faBell,
  faUser,
  faCompass,
} from "@fortawesome/free-regular-svg-icons";

import {
  faMagnifyingGlass,
  faMessage,
  faSquarePlus,
  faBars,
  faGear,
} from "@fortawesome/free-solid-svg-icons";

import brandLogo from "../assets/brand logo.svg";
import "../styles/sidebar.css";

function Sidebar() {
  const navigate = useNavigate();
  const { profile } = useUser(); // ✅ FROM CONTEXT
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const avatarUrl = profile?.avatar_url;

  return (
    <>
      {/* SIDEBAR */}
      <aside className="sidebar">

        {/* TOP */}
        <div className="sidebar-top">
          <div className="menu-item logo">
            <img src={brandLogo} alt="CodeGram" className="brand-icon" />
          </div>
        </div>

        {/* MIDDLE */}
        <div className="sidebar-middle">

          <div className="menu-item" onClick={() => navigate("/feed")}>
            <FontAwesomeIcon icon={faHouse} />
            <span>Home</span>
          </div>

          <div className="menu-item">
            <FontAwesomeIcon icon={faImage} />
            <span>Posts</span>
          </div>

          <div className="menu-item">
            <FontAwesomeIcon icon={faMessage} />
            <span>Messages</span>
          </div>

          <div className="menu-item">
            <FontAwesomeIcon icon={faMagnifyingGlass} />
            <span>Search</span>
          </div>

          <div className="menu-item">
            <FontAwesomeIcon icon={faCompass} />
            <span>Explore</span>
          </div>

          <div className="menu-item">
            <FontAwesomeIcon icon={faBell} />
            <span>Notifications</span>
          </div>

          <div className="menu-item">
            <FontAwesomeIcon icon={faSquarePlus} />
            <span>Create</span>
          </div>

          {/* PROFILE */}
          <div
            className="menu-item"
            onClick={() => navigate("/profile")}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                className="sidebar-avatar"
              />
            ) : (
              <FontAwesomeIcon icon={faUser} />
            )}
            <span>Profile</span>
          </div>

        </div>

        {/* BOTTOM */}
        <div className="sidebar-bottom">
          <div
            className="menu-item"
            onClick={() => setShowMoreMenu(true)}
          >
            <FontAwesomeIcon icon={faBars} />
            <span>More</span>
          </div>
        </div>
      </aside>

      {/* MORE MENU OVERLAY */}
      {showMoreMenu && (
        <>
          {/* CLICK OUTSIDE */}
          <div
            className="more-menu-overlay"
            onClick={() => setShowMoreMenu(false)}
          />

          {/* MENU */}
          <div className="more-menu">

            <div
              className="more-menu-item"
              onClick={() => {
                setShowMoreMenu(false);
                navigate("/settings");
              }}
            >
              <FontAwesomeIcon icon={faGear} />
              <span>Settings & Privacy</span>
            </div>

            <div className="more-menu-divider"></div>

            <div
              className="more-menu-item logout"
              onClick={() => {
                setShowMoreMenu(false);
                navigate("/logout"); // optional
              }}
            >
              <FontAwesomeIcon icon={faBars} />
              <span>Log out</span>
            </div>

          </div>
        </>
      )}
    </>
  );
}

export default Sidebar;
