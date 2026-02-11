import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { supabase } from "../lib/supabase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-regular-svg-icons";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import "../styles/profile.css";

function UserProfile() {
  const { username } = useParams();

  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();

      if (error) {
        console.log("Fetch user profile error:", error.message);
        setUserProfile(null);
      } else {
        setUserProfile(data);
      }

      setLoading(false);
    };

    fetchProfile();
  }, [username]);

  if (loading) return null;
  if (!userProfile) return <p style={{ color: "white" }}>User not found</p>;

  const avatarUrl = userProfile.avatar_url;

  return (
    <div className="profile-page">
      <Sidebar />

      <main className="profile-content">
        <div className="profile-header">

          {/* AVATAR */}
          <div className="profile-avatar">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="avatar-img" />
            ) : (
              <FontAwesomeIcon icon={faUserCircle} />
            )}
          </div>

          {/* INFO */}
          <div className="profile-info">

            <div className="profile-top-row">
              <h2 className="profile-username">{userProfile.username}</h2>

              <button className="profile-btn">Follow</button>

              <button className="icon-btn">•••</button>
            </div>

            <div className="profile-stats">
              <span><strong>0</strong> posts</span>
              <span><strong>0</strong> followers</span>
              <span><strong>0</strong> following</span>
            </div>

            <div className="profile-name">{userProfile.full_name}</div>

            {userProfile.bio && (
              <div className="profile-bio">
                <p className="bio-text">{userProfile.bio}</p>
              </div>
            )}
          </div>
        </div>

        {/* PRIVATE ACCOUNT VIEW */}
        {userProfile.is_private ? (
          <div className="private-account-box">
            <FontAwesomeIcon icon={faLock} className="private-lock-icon" />
            <h3>This account is private</h3>
            <p>Follow to see their photos and videos.</p>

            <button className="profile-btn">Follow</button>
          </div>
        ) : (
          <div className="profile-posts-section">
            <p className="no-posts-text">Public account posts will show here.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default UserProfile;
