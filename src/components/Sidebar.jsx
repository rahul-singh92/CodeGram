import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useUser } from "../context/UserContext";
import NotificationsSidebar from "./NotificationsSidebar";
import CreatePostModal from "./CreatePostModal";
import {
  HomeIcon,
  ReelsIcon,
  MessagesIcon,
  SearchIcon,
  ExploreIcon,
} from "./icons/AppIcons";


import {
  faHeart,
  faUser,
} from "@fortawesome/free-regular-svg-icons";

import {
  faSquarePlus,
  faBars,
  faGear,
} from "@fortawesome/free-solid-svg-icons";

import brandLogo from "../assets/brand logo.svg";
import "../styles/sidebar.css";
import { supabase } from "../lib/supabase";

function Sidebar() {
  const navigate = useNavigate();
  const { profile } = useUser();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);

  const fetchUnread = useCallback(async () => {
    if (!profile?.id) return;

    const { data, error } = await supabase
      .from("notifications")
      .select("id")
      .eq("user_id", profile.id)
      .eq("is_read", false)
      .limit(1);

    if (!error) {
      setHasUnread(data.length > 0);
    }
  }, [profile]);

  useEffect(() => {
    fetchUnread();
  }, [profile, fetchUnread]);

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
            <HomeIcon />
            <span>Home</span>
          </div>

          <div className="menu-item">
            <ReelsIcon />
            <span>Posts</span>
          </div>

          <div className="menu-item">
            <MessagesIcon />
            <span>Messages</span>
          </div>

          <div className="menu-item">
            <SearchIcon />
            <span>Search</span>
          </div>

          <div className="menu-item">
            <ExploreIcon />
            <span>Explore</span>
          </div>

          <div
            className="menu-item"
            onClick={() => setShowNotifications(true)}
          >
            <div className="notif-icon-wrapper">
              <FontAwesomeIcon icon={faHeart} />
              {profile?.push_notifications && hasUnread && (
                <span className="notif-red-dot"></span>
              )}
            </div>

            <span>Notifications</span>
          </div>

          <div className="menu-item" onClick={() => setShowCreatePost(true)}>
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

      <NotificationsSidebar
        open={showNotifications}
        onClose={() => {
          setShowNotifications(false);
          fetchUnread();
        }}
      />


<CreatePostModal
  open={showCreatePost}
  onClose={() => setShowCreatePost(false)}
  onSelectFile={() => {
    alert("File picker will open here");
  }}
/>

      {/* MORE MENU OVERLAY */}
      {showMoreMenu && (
        <>
          {/* CLICK OUTSIDE */}
          <div
            className="more-menu-overlay"
            onClick={() => setShowMoreMenu(false)

            }
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
              onClick={async () => {
                await supabase.auth.signOut();
                setShowMoreMenu(false);
                navigate("/");
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
