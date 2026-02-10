import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Sidebar from "../components/Sidebar";
import AvatarModal from "../components/AvatarModal";
import { useAvatarUpload } from "../hooks/useAvatarUpload";
import { useUser } from "../context/UserContext";
import { supabase } from "../lib/supabase";
import PostViewerModal from "../components/PostViewerModal";



import {
    faUserCircle,
} from "@fortawesome/free-regular-svg-icons";


import {
    faGear,
    faCalendar,
    faLocationDot
} from "@fortawesome/free-solid-svg-icons";

import "../styles/profile.css";

function Profile() {

    const {
        user,
        profile,
        setProfile,
        loading,
        cachedPosts,
        setCachedPosts,
        postsFetched,
        setPostsFetched
    } = useUser();

    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [showAccountInfo, setShowAccountInfo] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showFullBio, setShowFullBio] = useState(false);
    const [postsLoading, setPostsLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState(null);

    const navigate = useNavigate();

    const { uploadAvatar, removeAvatar } = useAvatarUpload(
        profile,
        setAvatarUrl,
        setAvatarLoading,
        setProfile
    );

    const isBioLong = profile?.bio && (
        profile.bio.length > 125 ||
        profile.bio.split("\n").length > 3
    );
    const fetchPosts = useCallback(async () => {
        if (!user) return;

        setPostsLoading(true);

        const { data, error } = await supabase
            .from("posts")
            .select(`
            id,
            caption,
            created_at,
            post_images (
                id,
                image_path,
                order_index
            )
        `)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.log("Error fetching posts:", error.message);
            setCachedPosts([]);
            setPostsFetched(true);
            setPostsLoading(false);
            return;
        }

        const formattedPosts = await Promise.all(
            data.map(async (post) => {
                const sortedImages = (post.post_images || []).sort(
                    (a, b) => a.order_index - b.order_index
                );

                const imagesWithSignedUrls = await Promise.all(
                    sortedImages.map(async (img) => {
                        const { data: signedData } = await supabase.storage
                            .from("posts")
                            .createSignedUrl(img.image_path, 3600);

                        return { ...img, signedUrl: signedData?.signedUrl || null };
                    })
                );

                return {
                    ...post,
                    post_images: imagesWithSignedUrls,
                };
            })
        );

        setCachedPosts(formattedPosts);
        setPostsFetched(true);
        setPostsLoading(false);
    }, [user, setCachedPosts, setPostsFetched]);




    useEffect(() => {
        if (!loading && !user) {
            navigate("/");
        }
    }, [loading, user, navigate]);

    useEffect(() => {
        if (profile?.avatar_url) {
            setAvatarUrl(profile.avatar_url);
        }
        else {
            setAvatarUrl(null);
        }
    }, [profile]);

    useEffect(() => {
        if (!user) return;

        if (!postsFetched) {
            fetchPosts();
        }
    }, [user, postsFetched, fetchPosts]);


    useEffect(() => {
        if (!user) return;

        if (!postsFetched) {
            fetchPosts();
        }
    }, [user, postsFetched, fetchPosts]);

    useEffect(() => {
        if (!user || cachedPosts.length === 0) return;

        const refreshSignedUrls = async () => {
            const refreshedPosts = await Promise.all(
                cachedPosts.map(async (post) => {
                    const refreshedImages = await Promise.all(
                        post.post_images.map(async (img) => {
                            const { data } = await supabase.storage
                                .from("posts")
                                .createSignedUrl(img.image_path, 3600);

                            return { ...img, signedUrl: data?.signedUrl || null };
                        })
                    );

                    return { ...post, post_images: refreshedImages };
                })
            );

            setCachedPosts(refreshedPosts);
        };

        const interval = setInterval(refreshSignedUrls, 55 * 60 * 1000);

        return () => clearInterval(interval);
    }, [user, cachedPosts, setCachedPosts]);


    const formatMonthYear = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
        });
    };

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


                            <button className="profile-btn" onClick={() => navigate("/settings")}>Edit Profile</button>
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
                            <span><strong>{cachedPosts.length}</strong> posts</span>
                            <span><strong>0</strong> followers</span>
                            <span><strong>0</strong> following</span>
                        </div>

                        {/* NAME */}
                        <div className="profile-name">
                            {profile.full_name}
                        </div>
                        {profile.bio && (
                            <div className="profile-bio">
                                <p className={`bio-text ${!showFullBio ? "clamped" : ""}`}>
                                    {profile.bio}
                                </p>

                                {isBioLong && (
                                    <span className="bio-more" onClick={() => setShowFullBio(!showFullBio)}>
                                        {showFullBio ? "less" : "...more"}
                                    </span>
                                )}
                            </div>
                        )}

                    </div>
                </div>
                {/* POSTS GRID */}
                <div className="profile-posts-section">
                    <div className="posts-grid">

                        {/* Skeleton only first time */}
                        {!postsFetched && postsLoading &&
                            Array.from({ length: 9 }).map((_, index) => (
                                <div key={index} className="post-skeleton"></div>
                            ))
                        }

                        {/* Show cached posts always */}
                        {cachedPosts.map((post) => {
                            const firstImage = post.post_images?.[0];

                            if (!firstImage?.signedUrl) return null;

                            return (
                                <div
                                    key={post.id}
                                    className="post-box"
                                    onClick={() => setSelectedPost(post)}
                                >
                                    <img
                                        src={firstImage.signedUrl}
                                        alt="post"
                                        className="post-img"
                                    />

                                    {post.post_images.length > 1 && (
                                        <div className="multi-icon">
                                            <svg
                                                aria-label="Carousel"
                                                fill="white"
                                                height="20"
                                                viewBox="0 0 48 48"
                                                width="20"
                                            >
                                                <path d="M40 10H20a6 6 0 0 0-6 6v20a6 6 0 0 0 6 6h20a6 6 0 0 0 6-6V16a6 6 0 0 0-6-6Zm2 26a2 2 0 0 1-2 2H20a2 2 0 0 1-2-2V16a2 2 0 0 1 2-2h20a2 2 0 0 1 2 2Z"></path>
                                                <path d="M28 6H12a6 6 0 0 0-6 6v16a2 2 0 0 0 4 0V12a2 2 0 0 1 2-2h16a2 2 0 0 0 0-4Z"></path>
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                    </div>


                    {postsFetched && cachedPosts.length === 0 && (
                        <p className="no-posts-text">No posts yet.</p>
                    )}

                </div>

                <AvatarModal
                    open={showPhotoModal}
                    onClose={() => setShowPhotoModal(false)}
                    onUpload={uploadAvatar}
                    onRemove={removeAvatar}
                    hasAvatar={!!avatarUrl}
                />

                <PostViewerModal
                    open={!!selectedPost}
                    onClose={() => setSelectedPost(null)}
                    post={selectedPost}
                    posts={cachedPosts}
                    profile={profile}
                    onNextPost={() => {
                        const currentIndex = cachedPosts.findIndex(p => p.id === selectedPost.id);
                        if (currentIndex < cachedPosts.length - 1) {
                            setSelectedPost(cachedPosts[currentIndex + 1]);
                        }
                    }}
                    onPrevPost={() => {
                        const currentIndex = cachedPosts.findIndex(p => p.id === selectedPost.id);
                        if (currentIndex > 0) {
                            setSelectedPost(cachedPosts[currentIndex - 1]);
                        }
                    }}
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
