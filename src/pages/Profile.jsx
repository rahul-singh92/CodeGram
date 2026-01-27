import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Sidebar from "../components/Sidebar";
import AvatarModal from "../components/AvatarModal";
import { useAvatarUpload } from "../hooks/useAvatarUpload";

/* REGULAR / OUTLINE ICONS */
import {
    faUserCircle
} from "@fortawesome/free-regular-svg-icons";

/* SOLID ICONS (no regular version exists) */
import {
    faGear,
    faCalendar,
    faLocationDot
} from "@fortawesome/free-solid-svg-icons";

import "../styles/profile.css";

function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [showAccountInfo, setShowAccountInfo] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const navigate = useNavigate();

    const { uploadAvatar, removeAvatar } = useAvatarUpload(
        profile,
        setAvatarUrl,
        setAvatarLoading
    );

    const formatMonthYear = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
        });
    };


    useEffect(() => {
        document.title = "CodeGram • Profile";

        const fetchProfile = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                await supabase.auth.signOut();
                navigate("/");
                return;
            }

            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (error || !data) {
                await supabase.auth.signOut();
                navigate("/");
                return;
            }

            setProfile(data);
            setAvatarUrl(data.avatar_url);
            setLoading(false);


            setLoading(false);
        };

        fetchProfile();
    }, [navigate]);

    if (loading || !profile) {
        return null;
    }


    return (
        <div className="profile-page">

            <Sidebar />


            {/* MAIN CONTENT */}
            <main className="profile-content">

                {/* PROFILE HEADER */}
                <div className="profile-header">

                    {/* PROFILE IMAGE */}
                    <div
                        className={`profile-avatar clickable ${avatarLoading ? "loading" : ""}`}
                        onClick={() => !avatarLoading && setShowPhotoModal(true)}
                    >
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" className="avatar-img" />
                        ) : (
                            <FontAwesomeIcon icon={faUserCircle} />
                        )}

                        {avatarLoading && (
                            <div className="avatar-spinner">
                                <div className="spinner"></div>
                            </div>
                        )}
                    </div>



                    {/* PROFILE INFO */}
                    <div className="profile-info">

                        {/* TOP ROW */}
                        <div className="profile-top-row">
                            <h2
                                className="profile-username clickable"
                                onClick={() => setShowAccountInfo(true)}
                            >
                                {profile.username}
                            </h2>


                            <button className="profile-btn">Edit Profile</button>
                            <button className="profile-btn secondary">View Archive</button>

                            <button
                                className="icon-btn"
                                onClick={() => setShowSettingsModal(true)}
                            >
                                <FontAwesomeIcon icon={faGear} />
                            </button>

                        </div>

                        {/* STATS ROW */}
                        <div className="profile-stats">
                            <span><strong>0</strong> posts</span>
                            <span><strong>0</strong> followers</span>
                            <span><strong>0</strong> following</span>
                        </div>

                        {/* NAME */}
                        <div className="profile-name">
                            {profile.full_name}
                        </div>

                    </div>
                </div>

                <AvatarModal
                    open={showPhotoModal}
                    onClose={() => setShowPhotoModal(false)}
                    onUpload={uploadAvatar}
                    onRemove={removeAvatar}
                    hasAvatar={!!avatarUrl}
                />

                {showAccountInfo && (
                    <div
                        className="modal-overlay"
                        onClick={() => setShowAccountInfo(false)}
                    >
                        <div
                            className="photo-modal account-modal"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* HEADER */}
                            <div className="modal-item header">
                                About your account
                            </div>

                            <div className="modal-divider"></div>

                            {/* PROFILE */}
                            <div className="account-profile">
                                <div className="account-avatar">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar" />
                                    ) : (
                                        <FontAwesomeIcon icon={faUserCircle} />
                                    )}
                                </div>

                                <div className="account-username">
                                    {profile.username}
                                </div>
                            </div>

                            {/* DESCRIPTION */}
                            <div className="account-desc">
                                To help keep our community authentic, we're showing information about
                                accounts on CodeGram. People can see this by tapping on the ••• on your
                                profile and choosing About this account.
                            </div>

                            {/* DATE JOINED */}
                            <div className="account-row">
                                <FontAwesomeIcon icon={faCalendar} />
                                <div>
                                    <div className="account-title">Date Joined</div>
                                    <div className="account-sub">
                                        {formatMonthYear(profile.created_at)}
                                    </div>
                                </div>
                            </div>

                            {/* LOCATION */}
                            <div className="account-row">
                                <FontAwesomeIcon icon={faLocationDot} />
                                <div>
                                    <div className="account-title">Account based in</div>
                                    <div className="account-sub">
                                        {profile.country || "Unknown"}
                                    </div>

                                </div>
                            </div>

                            <div className="modal-divider"></div>

                            {/* CLOSE */}
                            <div
                                className="modal-item cancel"
                                onClick={() => setShowAccountInfo(false)}
                            >
                                Close
                            </div>
                        </div>
                    </div>
                )}

                {showSettingsModal && (
                    <div
                        className="modal-overlay"
                        onClick={() => setShowSettingsModal(false)}
                    >
                        <div
                            className="photo-modal"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* SETTINGS */}
                            <div
                                className="modal-item action"
                                onClick={() => {
                                    setShowSettingsModal(false);
                                    navigate("/settings");
                                }}
                            >
                                Settings and Privacy
                            </div>

                            <div className="modal-divider"></div>

                            {/* LOG OUT */}
                            <div
                                className="modal-item action remove"
                                onClick={async () => {
                                    await supabase.auth.signOut();
                                    navigate("/");
                                }}
                            >
                                Log out
                            </div>

                            <div className="modal-divider"></div>

                            {/* CANCEL */}
                            <div
                                className="modal-item cancel"
                                onClick={() => setShowSettingsModal(false)}
                            >
                                Cancel
                            </div>
                        </div>
                    </div>
                )}


            </main>

        </div>
    );
}

export default Profile;
