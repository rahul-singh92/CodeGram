import { useState, useEffect } from "react";
import { SmileIcon } from "lucide-react";
import { supabase } from "../lib/supabase";
import "../styles/editPostModal.css";

const DeleteIcon = () => (
    <svg
        aria-label="Delete"
        fill="currentColor"
        height="16"
        role="img"
        viewBox="0 0 24 24"
        width="16"
    >
        <title>Delete</title>
        <line
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            x1="2.876"
            x2="21.124"
            y1="4.727"
            y2="4.727"
        ></line>
        <path
            d="M8.818 4.727v-1.59A1.136 1.136 0 0 1 9.954 2h4.092a1.136 1.136 0 0 1 1.136 1.136v1.591"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
        ></path>
        <path
            d="m4.377 4.727 1.987 15.88A1.59 1.59 0 0 0 7.942 22h8.116a1.59 1.59 0 0 0 1.578-1.393l1.987-15.88"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
        ></path>
    </svg>
);

function EditPostModal({
    open,
    onClose,
    post,
    profile,
    images,
    setImages,
    caption,
    setCaption,
    onDone,
    onDeletePostRequest
}) {
    const [saving, setSaving] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [showDeleteImageConfirm, setShowDeleteImageConfirm] = useState(false);
    const [showEmojiBox, setShowEmojiBox] = useState(false);


    useEffect(() => {
        setActiveIndex(0);
    }, [post]);

    if (!open) return null;

    const hasPrev = activeIndex > 0;
    const hasNext = activeIndex < images.length - 1;

    const handleSave = async () => {
        if (!post) return;

        setSaving(true);

        const { error } = await supabase
            .from("posts")
            .update({ caption })
            .eq("id", post.id);

        setSaving(false);

        if (error) {
            alert("Failed to update caption");
            return;
        }

        if (onDone) onDone("updated");
    };

    const handleDeleteCurrentImage = async () => {
        const img = images[activeIndex];
        if (!img) return;

        // if only one image => delete post instead
        if (images.length === 1) {
            if (onDeletePostRequest) onDeletePostRequest();
            return;
        }

        try {
            // delete from storage
            await supabase.storage.from("posts").remove([img.image_path]);

            // delete from post_images
            await supabase.from("post_images").delete().eq("id", img.id);

            // update local images
            const updated = images.filter((_, i) => i !== activeIndex);

            setImages(updated);

            // fix index
            if (activeIndex >= updated.length) {
                setActiveIndex(updated.length - 1);
            }

            setShowDeleteImageConfirm(false);

        } catch (err) {
            console.log(err.message);
            alert("Failed to delete image");
        }
    };

    return (
        <div className="ep-overlay" onClick={onClose}>
            <div className="ep-modal" onClick={(e) => e.stopPropagation()}>

                {/* HEADER */}
                <div className="ep-header">
                    <button className="ep-cancel" onClick={onClose}>
                        Cancel
                    </button>

                    <h3>Edit Info</h3>

                    <button
                        className="ep-done"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        Done
                    </button>
                </div>

                <div className="ep-divider"></div>

                {/* BODY */}
                <div className="ep-body">

                    {/* LEFT IMAGE */}
                    <div className="ep-image-box">

                        {hasPrev && (
                            <button
                                className="ep-arrow left"
                                onClick={() => setActiveIndex((p) => p - 1)}
                            >
                                ‹
                            </button>
                        )}

                        {images[activeIndex]?.signedUrl && (
                            <img src={images[activeIndex].signedUrl} alt="preview" />
                        )}

                        {hasNext && (
                            <button
                                className="ep-arrow right"
                                onClick={() => setActiveIndex((p) => p + 1)}
                            >
                                ›
                            </button>
                        )}

                        {/* DOTS */}
                        {images.length > 1 && (
                            <div className="ep-dots">
                                {images.map((_, i) => (
                                    <span
                                        key={i}
                                        className={`ep-dot ${i === activeIndex ? "active" : ""}`}
                                    />
                                ))}
                            </div>
                        )}

                        {/* DELETE ICON */}
                        <button
                            className="ep-delete-photo"
                            onClick={() => setShowDeleteImageConfirm(true)}
                        >
                            <DeleteIcon />
                        </button>
                    </div>

                    {/* RIGHT CAPTION */}
                    <div className="ep-caption-box">

                        {/* PROFILE ROW */}
                        <div className="ep-user-row">
                            <img
                                src={profile?.avatar_url || ""}
                                alt="avatar"
                                className="ep-user-avatar"
                            />
                            <span className="ep-user-name">{profile?.username}</span>
                        </div>

                        <div className="ep-divider"></div>

                        {/* TEXTAREA */}
                        <textarea
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder="Write a caption..."
                            maxLength={2200}
                        />

                        {/* FOOTER */}
                        <div className="ep-caption-footer">
                            <button
                                className="ep-emoji-btn"
                                onClick={() => setShowEmojiBox((prev) => !prev)}
                            >
                                <SmileIcon size={20} />
                            </button>

                            <span className="ep-word-count">{caption.length}/2,200</span>

                            {showEmojiBox && (
                                <div className="ep-emoji-box">
                                    {["😀", "😂", "😍", "🔥", "❤️", "👍", "👏", "🥺", "😎"].map((emoji) => (
                                        <button
                                            key={emoji}
                                            className="ep-emoji-item"
                                            onClick={() => {
                                                setCaption((prev) => prev + emoji);
                                                setShowEmojiBox(false);
                                            }}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>


                        <div className="ep-divider"></div>

                        {/* COMMENTS PLACEHOLDER */}
                        <div className="ep-comments-space"> </div>

                    </div>

                </div>


                {/* DELETE IMAGE CONFIRM */}
                {showDeleteImageConfirm && (
                    <div
                        className="ep-confirm-overlay"
                        onClick={() => setShowDeleteImageConfirm(false)}
                    >
                        <div
                            className="ep-confirm-box"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3>Delete photo?</h3>
                            <p>
                                If you delete this image, it will be permanently deleted and can't be recovered.
                            </p>

                            <div className="ep-confirm-divider"></div>

                            <button className="ep-confirm-delete" onClick={handleDeleteCurrentImage}>
                                Delete
                            </button>

                            <div className="ep-confirm-divider"></div>

                            <button
                                className="ep-confirm-cancel"
                                onClick={() => setShowDeleteImageConfirm(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

export default EditPostModal;
