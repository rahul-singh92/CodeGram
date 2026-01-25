import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import imageCompression from "browser-image-compression";


/* REGULAR / OUTLINE ICONS */
import {
    faHouse,
    faImage,
    faBell,
    faUser,
    faCompass,
    faUserCircle
} from "@fortawesome/free-regular-svg-icons";

/* SOLID ICONS (no regular version exists) */
import {
    faMagnifyingGlass,
    faMessage,
    faSquarePlus,
    faBars,
    faGear,
    faCalendar,
    faLocationDot
} from "@fortawesome/free-solid-svg-icons";

import brandLogo from "../assets/brand logo.svg";
import "../styles/profile.css";

function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [showAccountInfo, setShowAccountInfo] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const hasProfilePhoto = !!avatarUrl;
    const navigate = useNavigate();

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setAvatarLoading(true);
            setShowPhotoModal(false);

            const compressedFile = await imageCompression(file, {
                maxSizeMB: 0.3,          // ~300KB
                maxWidthOrHeight: 512,
                useWebWorker: true,
            });

            const fileExt = compressedFile.name.split(".").pop();
            const filePath = `${profile.id}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(filePath, compressedFile, {
                    upsert: true,
                    contentType: compressedFile.type,
                });

            if (uploadError) throw uploadError;

            const {
                data: { publicUrl },
            } = supabase.storage.from("avatars").getPublicUrl(filePath);

            const finalUrl = `${publicUrl}?t=${Date.now()}`;

            await supabase
                .from("profiles")
                .update({ avatar_url: publicUrl })
                .eq("id", profile.id);

            setAvatarUrl(finalUrl);
            setShowPhotoModal(false);
        } catch (err) {
            alert("Failed to upload image");
            console.error(err);
        } finally {
            setAvatarLoading(false);
        }
    };

    const getAvatarFilePath = (url) => {
        if (!url) return null;

        // Remove cache-busting query (?t=...)
        const cleanUrl = url.split("?")[0];

        // Extract path after /avatars/
        const parts = cleanUrl.split("/avatars/");
        return parts[1]; // e.g. "<uuid>.jpg"
    };

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

            {/* SIDEBAR */}
            <aside className="sidebar">

                {/* TOP LOGO */}
                <div className="sidebar-top">
                    <div className="menu-item logo">
                        <img src={brandLogo} alt="CodeGram Logo" className="brand-icon" />
                    </div>
                </div>

                {/* MIDDLE NAV */}
                <div className="sidebar-middle">
                    <div className="menu-item">
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

                    <div
                        className="menu-item"
                        onClick={() => navigate("/profile")}
                        style={{ cursor: "pointer" }}
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
                        onClick={() => setShowMoreMenu((prev) => !prev)}
                        style={{ cursor: "pointer" }}
                    >
                        <FontAwesomeIcon icon={faBars} />
                        <span>More</span>
                    </div>

                </div>

            </aside>

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

                {showPhotoModal && (
                    <div
                        className="modal-overlay"
                        onClick={() => setShowPhotoModal(false)}
                    >
                        <div
                            className="photo-modal"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-item header">
                                Change Profile Photo
                            </div>

                            <div className="modal-divider"></div>

                            <div
                                className="modal-item action upload"
                                onClick={() => document.getElementById("avatarInput").click()}
                            >
                                Upload Photo
                            </div>


                            {hasProfilePhoto && (
                                <>
                                    <div className="modal-divider"></div>
                                    <div
                                        className="modal-item action remove"
                                        onClick={async () => {
                                            try {
                                                setAvatarLoading(true);
                                                setShowPhotoModal(false);
                                                const filePath = getAvatarFilePath(avatarUrl);

                                                if (filePath) {
                                                    await supabase.storage
                                                        .from("avatars")
                                                        .remove([filePath]);
                                                }

                                                await supabase
                                                    .from("profiles")
                                                    .update({ avatar_url: null })
                                                    .eq("id", profile.id);

                                                setAvatarUrl(null);
                                                setShowPhotoModal(false);
                                            } catch (err) {
                                                console.error(err);
                                                alert("Failed to remove profile photo");
                                            } finally {
                                                setAvatarLoading(false);
                                            }
                                        }}
                                    >
                                        Remove Current Photo
                                    </div>


                                </>
                            )}

                            <div className="modal-divider"></div>

                            <div
                                className="modal-item cancel"
                                onClick={() => setShowPhotoModal(false)}
                            >
                                Cancel
                            </div>
                        </div>
                    </div>
                )}

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

                {showMoreMenu && (
                    <>
                        {/* CLICK OUTSIDE OVERLAY */}
                        <div
                            className="more-menu-overlay"
                            onClick={() => setShowMoreMenu(false)}
                        />

                        {/* POPUP MENU */}
                        <div className="more-menu">
                            <div
                                className="more-menu-item"
                                onClick={() => {
                                    setShowMoreMenu(false);
                                    navigate("/settings")
                                }}
                            >
                                <FontAwesomeIcon icon={faGear} />
                                <span>Settings</span>
                            </div>

                            <div className="more-menu-divider"></div>

                            <div
                                className="more-menu-item logout"
                                onClick={async () => {
                                    await supabase.auth.signOut();
                                    navigate("/");
                                }}
                            >
                                <FontAwesomeIcon icon={faBars} />
                                <span>Log out</span>
                            </div>
                        </div>
                    </>
                )}

                <input
                    type="file"
                    accept="image/*"
                    id="avatarInput"
                    hidden
                    onChange={handleAvatarUpload}
                />


            </main>

        </div>
    );
}

export default Profile;
