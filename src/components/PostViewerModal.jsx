import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEllipsisH,
    faChevronLeft,
    faChevronRight,
    faXmark
} from "@fortawesome/free-solid-svg-icons";

import "../styles/postViewerModal.css";

function PostViewerModal({
    open,
    onClose,
    post,
    posts,
    profile,
    onNextPost,
    onPrevPost,
}) {
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    useEffect(() => {
        // reset image index whenever post changes
        setActiveImageIndex(0);
    }, [post]);

    if (!open || !post) return null;

    const images = post.post_images || [];
    const currentImage = images[activeImageIndex];

    const currentPostIndex = posts.findIndex((p) => p.id === post.id);
    const hasPrevPost = currentPostIndex > 0;
    const hasNextPost = currentPostIndex < posts.length - 1;

    const hasPrevImage = activeImageIndex > 0;
    const hasNextImage = activeImageIndex < images.length - 1;

    const timeAgoWeeks = (dateString) => {
        const createdDate = new Date(dateString);
        const now = new Date();
        const diffMs = now - createdDate;

        const weeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
        return `${weeks} weeks`;
    };

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

                            <button className="pv-dots-btn">
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
                                {timeAgoWeeks(post.created_at)}
                            </div>

                            {/* COMMENTS PLACEHOLDER */}
                            <div className="pv-comments-space"></div>
                        </div>
                    </div>
                </div>

                {/* POST RIGHT ARROW */}
                {hasNextPost && (
                    <button className="pv-arrow right" onClick={onNextPost}>
                        <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                )}
            </div>
        </div>
    );
}

export default PostViewerModal;
