import { useEffect, useState, useRef, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEllipsisH,
    faChevronLeft,
    faChevronRight,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";

import "../styles/postViewerModal.css";
import {
    LikeIcon,
    CommentIcon,
    ShareIcon,
    SaveIcon,
    EmojiIcon,
    UnlikeIcon
} from "../components/icons/AppIcons";
import EditPostModal from "./EditPostModal";
import { supabase } from "../lib/supabase";
import { useUser } from "../context/UserContext";
import AboutAccountModal from "./AboutAccountModal";


function PostViewerModal({
    open,
    onClose,
    post,
    posts,
    profile,
    onNextPost,
    onPrevPost,
    onPostDeleted,
    onPostUpdated
}) {
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [commentText, setCommentText] = useState("");
    const [showEmojiBox, setShowEmojiBox] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(true);
    const [showCommentMenu, setShowCommentMenu] = useState(false);
    const [selectedComment, setSelectedComment] = useState(null);
    const [showPostMenu, setShowPostMenu] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editCaption, setEditCaption] = useState("");
    const [editImages, setEditImages] = useState([]);
    const [showDeletePostConfirm, setShowDeletePostConfirm] = useState(false);
    const [showAboutAccount, setShowAboutAccount] = useState(false);
    const [likers, setLikers] = useState([]);


    const commentRef = useRef(null);

    const { user } = useUser();


    const timeAgo = (dateString) => {
        const now = new Date();
        const past = new Date(dateString);

        const diffSeconds = Math.floor((now - past) / 1000);

        if (diffSeconds < 60) return `${diffSeconds}s`;

        const diffMinutes = Math.floor(diffSeconds / 60);
        if (diffMinutes < 60) return `${diffMinutes}m`;

        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours}h`;

        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays}d`;

        const diffWeeks = Math.floor(diffDays / 7);
        return `${diffWeeks}w`;
    };

    const handleDeletePost = async () => {
        if (!post) return;

        try {
            const imagePaths = (post.post_images || []).map((img) => img.image_path);

            // delete from storage
            if (imagePaths.length > 0) {
                const { error: storageError } = await supabase.storage
                    .from("posts")
                    .remove(imagePaths);

                if (storageError) {
                    console.log("Storage delete error:", storageError.message);
                }
            }

            // delete notifications related to this post
            await supabase
                .from("notifications")
                .delete()
                .eq("post_id", post.id);

            // delete post row (cascade deletes likes/comments/post_images)
            const { error } = await supabase
                .from("posts")
                .delete()
                .eq("id", post.id);

            if (error) throw error;

            setShowDeletePostConfirm(false);

            // remove from UI instantly
            if (onPostDeleted) onPostDeleted(post.id);

            onClose();
        } catch (err) {
            console.log("Delete post error:", err.message);
            alert("Failed to delete post");
        }
    };



    const handleDeleteComment = async () => {
        if (!selectedComment) return;

        const { error } = await supabase
            .from("comments")
            .delete()
            .eq("id", selectedComment.id);

        if (error) {
            console.log("Delete comment error:", error.message);
            alert("Failed to delete comment");
            return;
        }

        setShowCommentMenu(false);
        setSelectedComment(null);

        fetchComments(); // refresh UI
    };


    const fetchComments = useCallback(async () => {
        if (!post) return;

        setCommentsLoading(true);

        const { data: commentsData, error } = await supabase
            .from("comments")
            .select("id, content, created_at, user_id")
            .eq("post_id", post.id)
            .order("created_at", { ascending: true });

        if (error) {
            console.log("Fetch comments error:", error.message);
            setComments([]);
            setCommentsLoading(false);
            return;
        }

        const userIds = [...new Set(commentsData.map((c) => c.user_id))];

        const { data: profilesData, error: profilesError } = await supabase
            .from("profiles")
            .select("id, username, avatar_url")
            .in("id", userIds);

        if (profilesError) {
            console.log("Fetch profiles error:", profilesError.message);
        }

        const profileMap = {};
        (profilesData || []).forEach((p) => {
            profileMap[p.id] = p;
        });

        const merged = commentsData.map((c) => ({
            ...c,
            profile: profileMap[c.user_id] || null,
        }));

        setComments(merged);
        setCommentsLoading(false);
    }, [post]);


    useEffect(() => {
        // reset image index whenever post changes
        setActiveImageIndex(0);
    }, [post]);

    useEffect(() => {
        if (!post) return;

        setEditCaption(post.caption || "");
        setEditImages(post.post_images || []);
    }, [post]);


    useEffect(() => {
        if (!post) return;
        setIsLiked(post.isLiked || false);
        setLikesCount(post.likesCount || 0);
    }, [post]);

    useEffect(() => {
        if (!post) return;

        const channel = supabase
            .channel("realtime-comments")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "comments",
                    filter: `post_id=eq.${post.id}`,
                },
                () => {
                    fetchComments();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [post, fetchComments]);

    useEffect(() => {
        if (open && post) {
            fetchComments();
        }
    }, [open, post, fetchComments]);


    useEffect(() => {
        if (!post) return;

        const fetchLikers = async () => {
            const { data: likesData, error } = await supabase
                .from("likes")
                .select("user_id")
                .eq("post_id", post.id);

            if (error) {
                console.log("Fetch likes error:", error.message);
                setLikers([]);
                return;
            }

            const likerIds = likesData
                .map((l) => l.user_id);

            if (likerIds.length === 0) {
                setLikers([]);
                return;
            }

            const { data: profilesData, error: profileError } = await supabase
                .from("profiles")
                .select("id, avatar_url")
                .in("id", likerIds);

            if (profileError) {
                console.log("Fetch liker profiles error:", profileError.message);
                setLikers([]);
                return;
            }

            setLikers(profilesData || []);
        };

        fetchLikers();
    }, [post, user]);

    if (!open || !post) return null;


    const handlePostComment = async () => {
        if (!commentText.trim()) return;
        if (!user) return;

        const text = commentText.trim();

        setCommentText("");
        setShowEmojiBox(false);

        if (commentRef.current) {
            commentRef.current.style.height = "auto";
        }

        const { error } = await supabase
            .from("comments")
            .insert([
                {
                    user_id: user.id,
                    post_id: post.id,
                    content: text,
                },
            ]);

        if (error) {
            console.log("Comment insert error:", error.message);
            alert("Failed to post comment");
            setCommentText(text); // rollback
            return;
        }

        // fetch again
        fetchComments();
    };

    const handleToggleLike = async () => {
        if (!user) return;

        try {
            if (isLiked) {
                // UNLIKE
                setIsLiked(false);
                setLikesCount((prev) => prev - 1);

                const { error } = await supabase
                    .from("likes")
                    .delete()
                    .eq("user_id", user.id)
                    .eq("post_id", post.id);

                if (error) throw error;
            } else {
                // LIKE
                setIsLiked(true);
                setLikesCount((prev) => prev + 1);

                const { error } = await supabase
                    .from("likes")
                    .insert([{ user_id: user.id, post_id: post.id }]);

                if (error) throw error;
            }
        } catch (err) {
            console.log("Like error:", err.message);

            // rollback UI if error
            setIsLiked(post.isLiked || false);
            setLikesCount(post.likesCount || 0);
        }
    };


    const images = post.post_images || [];
    const currentImage = images[activeImageIndex];

    const currentPostIndex = posts.findIndex((p) => p.id === post.id);
    const hasPrevPost = currentPostIndex > 0;
    const hasNextPost = currentPostIndex < posts.length - 1;

    const hasPrevImage = activeImageIndex > 0;
    const hasNextImage = activeImageIndex < images.length - 1;

    const handleCommentChange = (e) => {
        setCommentText(e.target.value);

        e.target.style.height = "auto";
        e.target.style.height = Math.min(e.target.scrollHeight, 80) + "px";
    };

    const isOwner = user?.id === post.user_id;

    return (
        <div className="pv-overlay" onClick={onClose}>
            <div className="pv-wrapper" onClick={(e) => e.stopPropagation()}>

                {/* CLOSE BUTTON */}
                <button className="pv-close-btn" onClick={onClose}>
                    <FontAwesomeIcon icon={faXmark} />
                </button>


                {/* POST LEFT ARROW */}
                {hasPrevPost && (
                    <button className="pv-arrow left" onClick={onPrevPost}>
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                )}

                {/* MAIN MODAL */}
                <div className="pv-modal">

                    {/* IMAGE SECTION */}
                    <div className="pv-image-section">

                        {/* IMAGE LEFT ARROW */}
                        {hasPrevImage && (
                            <button
                                className="pv-img-arrow left"
                                onClick={() => setActiveImageIndex((prev) => prev - 1)}
                            >
                                <FontAwesomeIcon icon={faChevronLeft} />
                            </button>
                        )}

                        {/* IMAGE */}
                        {currentImage?.signedUrl && (
                            <img
                                src={currentImage.signedUrl}
                                alt="post"
                                className="pv-image"
                            />
                        )}

                        {/* IMAGE RIGHT ARROW */}
                        {hasNextImage && (
                            <button
                                className="pv-img-arrow right"
                                onClick={() => setActiveImageIndex((prev) => prev + 1)}
                            >
                                <FontAwesomeIcon icon={faChevronRight} />
                            </button>
                        )}

                        {/* DOTS */}
                        {images.length > 1 && (
                            <div className="pv-dots">
                                {images.map((_, index) => (
                                    <span
                                        key={index}
                                        className={`pv-dot ${index === activeImageIndex ? "active" : ""}`}
                                    ></span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* RIGHT SECTION */}
                    <div className="pv-right">

                        {/* TOP HEADER */}
                        <div className="pv-header">
                            <div className="pv-user">
                                <img
                                    src={profile?.avatar_url || ""}
                                    alt="avatar"
                                    className="pv-avatar"
                                />
                                <span className="pv-username">{profile?.username}</span>
                            </div>

                            <button className="pv-dots-btn" onClick={() => setShowPostMenu(true)}>
                                <FontAwesomeIcon icon={faEllipsisH} />
                            </button>
                        </div>

                        <div className="pv-divider"></div>

                        {/* CAPTION AREA */}
                        <div className="pv-caption-area">

                            <div className="pv-caption-row">
                                <img
                                    src={profile?.avatar_url || ""}
                                    alt="avatar"
                                    className="pv-avatar small"
                                />

                                <div className="pv-caption-text">
                                    <span className="pv-username">{profile?.username}</span>{" "}
                                    <span>{post.caption}</span>
                                </div>
                            </div>

                            <div className="pv-time">
                                {timeAgo(post.created_at)}
                            </div>

                            {/* COMMENTS PLACEHOLDER */}
                            <div className="pv-comments-space">

                                {commentsLoading && <p className="pv-comments-loading">Loading comments...</p>}

                                {!commentsLoading && comments.length === 0 && (
                                    <p className="pv-no-comments">No comments yet.</p>
                                )}

                                {!commentsLoading &&
                                    comments.map((c) => (
                                        <div key={c.id} className="pv-comment-row">
                                            <img
                                                src={c.profile?.avatar_url || ""}
                                                alt="avatar"
                                                className="pv-avatar small"
                                            />

                                            <div className="pv-comment-text">
                                                <span className="pv-username">{c.profile?.username || "user"}</span>{" "}
                                                <span>{c.content}</span>

                                                <div className="pv-comment-time">
                                                    {timeAgo(c.created_at)}
                                                </div>
                                            </div>
                                            {/* 3 DOT MENU */}
                                            {c.user_id === user?.id && (
                                                <button
                                                    className="pv-comment-menu-btn"
                                                    onClick={() => {
                                                        setSelectedComment(c);
                                                        setShowCommentMenu(true);
                                                    }}
                                                >
                                                    •••
                                                </button>
                                            )}
                                        </div>
                                    ))
                                }
                            </div>

                        </div>

                        {/* BOTTOM ACTIONS */}
                        <div className="pv-actions">

                            {/* ICON ROW */}
                            <div className="pv-action-row">
                                <div className="pv-action-left">
                                    <button className={`pv-icon-btn ${isLiked ? "liked" : ""}`} onClick={handleToggleLike}>
                                        {isLiked ? <UnlikeIcon /> : <LikeIcon />}
                                    </button>

                                    <button className="pv-icon-btn" onClick={() => {
                                        if (commentRef.current) {
                                            commentRef.current.focus();
                                        }
                                    }}>
                                        <CommentIcon />
                                    </button>

                                    <button className="pv-icon-btn">
                                        <ShareIcon />
                                    </button>
                                </div>

                                <button className="pv-icon-btn">
                                    <SaveIcon />
                                </button>
                            </div>

                            {/* LIKES SECTION */}
                            {likesCount > 0 && (
                                <div className="pv-likes-row">

                                    {/* show avatars only if likes > 1 */}
                                    {likesCount > 1 && likers.length > 0 && (
                                        <div className="pv-liked-avatars">
                                            {likers.slice(0, 3).map((p) => (
                                                <img
                                                    key={p.id}
                                                    className="pv-like-avatar"
                                                    src={p.avatar_url || ""}
                                                    alt="liker"
                                                />
                                            ))}
                                        </div>
                                    )}

                                    <div className="pv-likes-text">
                                        {likesCount === 1 ? (
                                            <span>Liked by <strong>1 person</strong></span>
                                        ) : (
                                            <span>Liked by <strong>{likesCount}</strong> people</span>
                                        )}
                                    </div>
                                </div>
                            )}


                            {/* DATE */}
                            <div className="pv-post-date">
                                {new Date(post.created_at).toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                })}
                            </div>

                            <div className="pv-divider"></div>

                            {/* ADD COMMENT */}
                            <div className="pv-comment-box">

                                <button
                                    className="pv-emoji-btn"
                                    onClick={() => setShowEmojiBox(!showEmojiBox)}
                                >
                                    <EmojiIcon />
                                </button>

                                <textarea
                                    ref={commentRef}
                                    className="pv-comment-input"
                                    placeholder="Add a comment..."
                                    value={commentText}
                                    onChange={handleCommentChange}
                                />

                                <button
                                    className={`pv-post-btn ${commentText.trim() ? "active" : ""}`}
                                    onClick={handlePostComment}
                                >
                                    Post
                                </button>

                                {/* EMOJI BOX */}
                                {showEmojiBox && (
                                    <div className="pv-emoji-box">
                                        {["😀", "😂", "😍", "🔥", "❤️", "👍", "👏", "🥺", "😎"].map((emoji) => (
                                            <button
                                                key={emoji}
                                                className="pv-emoji-item"
                                                onClick={() => {
                                                    setCommentText((prev) => prev + emoji);
                                                    setShowEmojiBox(false);
                                                }}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
                <EditPostModal
                    open={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    post={post}
                    profile={profile}
                    images={editImages}
                    setImages={setEditImages}
                    caption={editCaption}
                    setCaption={setEditCaption}
                    onDone={() => {
                        setShowEditModal(false);

                        if (onPostUpdated) {
                            onPostUpdated(post.id, {
                                caption: editCaption,
                                post_images: editImages
                            });
                        }
                    }}
                    onDeletePostRequest={() => {
                        setShowEditModal(false);
                        setShowDeletePostConfirm(true);
                    }}
                />

                {/* POST RIGHT ARROW */}
                {hasNextPost && (
                    <button className="pv-arrow right" onClick={onNextPost}>
                        <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                )}

                {showPostMenu && (
                    <div
                        className="pv-post-menu-overlay"
                        onClick={() => setShowPostMenu(false)}
                    >
                        <div
                            className="pv-post-menu-box"
                            onClick={(e) => e.stopPropagation()}
                        >

                            {isOwner ? (
                                <>
                                    <div
                                        className="pv-post-menu-item delete"
                                        onClick={() => {
                                            setShowPostMenu(false);
                                            setShowDeletePostConfirm(true);
                                        }}
                                    >
                                        Delete
                                    </div>

                                    <div className="pv-post-menu-divider"></div>

                                    <div
                                        className="pv-post-menu-item"
                                        onClick={() => {
                                            setShowPostMenu(false);
                                            setShowEditModal(true);
                                        }}
                                    >
                                        Edit
                                    </div>

                                    <div className="pv-post-menu-divider"></div>
                                </>
                            ) : null}

                            <div
                                className="pv-post-menu-item"
                                onClick={() => {
                                    setShowPostMenu(false);
                                    setShowAboutAccount(true);
                                }}
                            >
                                About this account
                            </div>

                            <div className="pv-post-menu-divider"></div>

                            <div
                                className="pv-post-menu-item cancel"
                                onClick={() => setShowPostMenu(false)}
                            >
                                Close
                            </div>
                        </div>
                    </div>
                )}

                <AboutAccountModal
                    open={showAboutAccount}
                    onClose={() => setShowAboutAccount(false)}
                    profile={profile}
                    avatarUrl={profile?.avatar_url}
                />


                {showDeletePostConfirm && (
                    <div
                        className="pv-post-menu-overlay"
                        onClick={() => setShowDeletePostConfirm(false)}
                    >
                        <div
                            className="pv-confirm-box"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="pv-confirm-title">Delete post?</h3>

                            <p className="pv-confirm-subtitle">
                                If you delete your post, it will be permanently deleted and can't be recovered.
                            </p>

                            <div className="pv-post-menu-divider"></div>

                            <div
                                className="pv-post-menu-item delete"
                                onClick={handleDeletePost}
                            >
                                Delete
                            </div>

                            <div className="pv-post-menu-divider"></div>

                            <div
                                className="pv-post-menu-item cancel"
                                onClick={() => setShowDeletePostConfirm(false)}
                            >
                                Cancel
                            </div>
                        </div>
                    </div>
                )}



                {showCommentMenu && (
                    <div
                        className="pv-comment-menu-overlay"
                        onClick={() => {
                            setShowCommentMenu(false);
                            setSelectedComment(null);
                        }}
                    >
                        <div
                            className="pv-comment-menu-box"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div
                                className="pv-comment-menu-item delete"
                                onClick={handleDeleteComment}
                            >
                                Delete
                            </div>

                            <div className="pv-comment-menu-divider"></div>

                            <div
                                className="pv-comment-menu-item cancel"
                                onClick={() => {
                                    setShowCommentMenu(false);
                                    setSelectedComment(null);
                                }}
                            >
                                Cancel
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

export default PostViewerModal;
