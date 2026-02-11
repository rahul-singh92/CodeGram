import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Sidebar from "../components/Sidebar";
import AvatarModal from "../components/AvatarModal";
import { useAvatarUpload } from "../hooks/useAvatarUpload";
import { useUser } from "../context/UserContext";
import { supabase } from "../lib/supabase";
import PostViewerModal from "../components/PostViewerModal";
import AboutAccountModal from "../components/AboutAccountModal";


import {
    faUserCircle,
} from "@fortawesome/free-regular-svg-icons";


import {
    faGear,
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
    const { username } = useParams();
    const isVisitingUser = !!username;
    //Visisted user
    const [viewProfile, setViewProfile] = useState(null);
    const [viewPosts, setViewPosts] = useState([]);
    const [viewPostsLoading, setViewPostsLoading] = useState(false);
    const currentProfile = isVisitingUser ? viewProfile : profile;
    const currentPosts = isVisitingUser ? viewPosts : cachedPosts;
    const finalAvatarUrl = isVisitingUser ? currentProfile?.avatar_url : avatarUrl;
    const navigate = useNavigate();

    const { uploadAvatar, removeAvatar } = useAvatarUpload(
        profile,
        setAvatarUrl,
        setAvatarLoading,
        setProfile
    );

    const isBioLong = currentProfile?.bio && (
        currentProfile.bio.length > 125 ||
        currentProfile.bio.split("\n").length > 3
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
            ),
            likes (
                user_id
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
                    likesCount: post.likes?.length || 0,
                    isLiked: post.likes?.some((l) => l.user_id === user.id) || false,
                };
            })
        );

        setCachedPosts(formattedPosts);
        setPostsFetched(true);
        setPostsLoading(false);
    }, [user, setCachedPosts, setPostsFetched]);




    useEffect(() => {
        if (!loading && !user && !isVisitingUser) {
            navigate("/");
        }
    }, [loading, user, navigate, isVisitingUser]);

    useEffect(() => {
        setSelectedPost(null);
    }, [username]);



    useEffect(() => {
        if (!isVisitingUser) return;

        const fetchVisitedProfile = async () => {
            const decodedUsername = decodeURIComponent(username);

            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("username", decodedUsername)
                .single();

            if (error) {
                console.log("Error fetching visited profile:", error.message);
                setViewProfile(null);
                return;
            }

            setViewProfile(data);
        };

        fetchVisitedProfile();
    }, [username, isVisitingUser]);

    useEffect(() => {
        if (!isVisitingUser) return;
        if (!viewProfile) return;

        if (viewProfile.is_private) {
            setViewPosts([]);
            setViewPostsLoading(false);
            return;
        }

        const fetchVisitedPosts = async () => {
            setViewPostsLoading(true);

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
                ),
                likes (
                    user_id
                )
            `)
                .eq("user_id", viewProfile.id)
                .order("created_at", { ascending: false });

            if (error) {
                console.log("Error fetching visited posts:", error.message);
                setViewPosts([]);
                setViewPostsLoading(false);
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
                        likesCount: post.likes?.length || 0,
                        isLiked: false,
                    };
                })
            );

            setViewPosts(formattedPosts);
            setViewPostsLoading(false);
        };

        fetchVisitedPosts();
    }, [viewProfile, isVisitingUser]);

    useEffect(() => {
        if (!isVisitingUser) {
            if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);
            else setAvatarUrl(null);
        }
    }, [profile, isVisitingUser]);

    useEffect(() => {
        if (isVisitingUser) return;
        if (!user) return;

        if (!postsFetched) {
            fetchPosts();
        }
    }, [user, postsFetched, fetchPosts, isVisitingUser]);

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

    if (loading) return null;
    if (!currentProfile) return null;


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
                        onClick={() => {
                            if (!isVisitingUser && !avatarLoading) {
                                setShowPhotoModal(true);
                            }
                        }}

                    >
                        {finalAvatarUrl ? (
                            <img src={finalAvatarUrl} alt="Avatar" className="avatar-img" />
                        ) : (
                            <FontAwesomeIcon icon={faUserCircle} />
                        )}

                        {!isVisitingUser && avatarLoading && (
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
                                {currentProfile.username}
                            </h2>


                            {!isVisitingUser ? (
                                <>
                                    <button className="profile-btn" onClick={() => navigate("/settings")}>
                                        Edit Profile
                                    </button>
                                    <button className="profile-btn secondary">View Archive</button>

                                    <button className="icon-btn" onClick={() => setShowSettingsModal(true)}>
                                        <FontAwesomeIcon icon={faGear} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button className="profile-btn">Follow</button>
                                    <button className="icon-btn">•••</button>
                                </>
                            )}


                        </div>

                        {/* STATS ROW */}
                        <div className="profile-stats">
                            <span><strong>{currentPosts.length}</strong> posts</span>
                            <span><strong>0</strong> followers</span>
                            <span><strong>0</strong> following</span>
                        </div>

                        {/* NAME */}
                        <div className="profile-name">
                            {currentProfile.full_name}
                        </div>
                        {currentProfile.bio && (
                            <div className="profile-bio">
                                <p className={`bio-text ${!showFullBio ? "clamped" : ""}`}>
                                    {currentProfile.bio}
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

                    {isVisitingUser && currentProfile.is_private ? (
                        <div className="private-account-box">

                            {/* LOCK ICON IN CIRCLE */}
                            <div className="private-lock-circle">
                                <svg
                                    aria-label="Private"
                                    fill="white"
                                    height="28"
                                    viewBox="0 0 48 48"
                                    width="28"
                                >
                                    <path d="M24 4c-6.6 0-12 5.4-12 12v6h-2c-2.2 0-4 1.8-4 4v14c0 2.2 1.8 4 4 4h28c2.2 0 4-1.8 4-4V26c0-2.2-1.8-4-4-4h-2v-6c0-6.6-5.4-12-12-12Zm-8 12c0-4.4 3.6-8 8-8s8 3.6 8 8v6H16v-6Zm22 24H10V26h28v14Z"></path>
                                </svg>
                            </div>

                            <h3>This account is private</h3>
                            <p>Follow to see their photos and videos.</p>

                            <button className="profile-btn">Follow</button>
                        </div>
                    ) : (
                        <div className="posts-grid">

                            {/* Skeleton */}
                            {((!isVisitingUser && !postsFetched && postsLoading) ||
                                (isVisitingUser && viewPostsLoading)) &&
                                Array.from({ length: 9 }).map((_, index) => (
                                    <div key={index} className="post-skeleton"></div>
                                ))
                            }

                            {/* POSTS */}
                            {currentPosts.map((post) => {
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
                    )}

                </div>


                {!isVisitingUser && (
                    <AvatarModal
                        open={showPhotoModal}
                        onClose={() => setShowPhotoModal(false)}
                        onUpload={uploadAvatar}
                        onRemove={removeAvatar}
                        hasAvatar={!!avatarUrl}
                    />
                )}

                {!(isVisitingUser && currentProfile.is_private) && (
                    <PostViewerModal
                        open={!!selectedPost}
                        onClose={() => setSelectedPost(null)}
                        post={selectedPost}
                        posts={currentPosts}
                        profile={currentProfile}
                        onNextPost={() => {
                            const currentIndex = currentPosts.findIndex(p => p.id === selectedPost.id);
                            if (currentIndex < currentPosts.length - 1) {
                                setSelectedPost(currentPosts[currentIndex + 1]);
                            }
                        }}
                        onPrevPost={() => {
                            const currentIndex = currentPosts.findIndex(p => p.id === selectedPost.id);
                            if (currentIndex > 0) {
                                setSelectedPost(currentPosts[currentIndex - 1]);
                            }
                        }}
                        onPostDeleted={(postId) => {
                            if (isVisitingUser) {
                                setViewPosts((prev) => prev.filter((p) => p.id !== postId));
                            } else {
                                setCachedPosts((prev) => prev.filter((p) => p.id !== postId));
                            }
                            setSelectedPost(null);
                        }}

                        onPostUpdated={(postId, updatedData) => {
                            if (isVisitingUser) {
                                setViewPosts((prev) =>
                                    prev.map((p) =>
                                        p.id === postId ? { ...p, ...updatedData } : p
                                    )
                                );
                            } else {
                                setCachedPosts((prev) =>
                                    prev.map((p) =>
                                        p.id === postId ? { ...p, ...updatedData } : p
                                    )
                                );
                            }

                            setSelectedPost((prev) =>
                                prev?.id === postId ? { ...prev, ...updatedData } : prev
                            );
                        }}
                    />
                )}
                <AboutAccountModal
                    open={showAccountInfo}
                    onClose={() => setShowAccountInfo(false)}
                    profile={currentProfile}
                    avatarUrl={finalAvatarUrl}
                />


                {!isVisitingUser && showSettingsModal && (
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
