import { useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useUser } from "../context/UserContext";

function NotificationsSidebar({ open, onClose }) {
    const { profile } = useUser();

    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState([]);

    // ---------- GROUPING LOGIC ----------
    const groupNotifications = (list) => {
        const groups = {
            Today: [],
            Yesterday: [],
            "This Week": [],
            "This Month": [],
            Older: [],
        };

        const now = new Date();

        list.forEach((n) => {
            const created = new Date(n.created_at);

            const diffMs = now - created;
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

            if (diffDays === 0) groups.Today.push(n);
            else if (diffDays === 1) groups.Yesterday.push(n);
            else if (diffDays <= 7) groups["This Week"].push(n);
            else if (diffDays <= 30) groups["This Month"].push(n);
            else groups.Older.push(n);
        });

        return groups;
    };

    // ---------- FETCH NOTIFICATIONS ----------
    const fetchNotifications = useCallback(async () => {
        if (!profile?.id) return;

        try {
            setLoading(true);

            const { data, error } = await supabase
                .from("notifications")
                .select(`
                    id,
                    user_id,
                    actor_id,
                    post_id,
                    type,
                    message,
                    is_read,
                    created_at,
                    actor:profiles!notifications_actor_id_profiles_fkey (
                    username,
                    avatar_url
                    )
                `)
                .eq("user_id", profile.id)
                .order("created_at", { ascending: false })
                .limit(100);


            if (error) throw error;

            setNotifications(data || []);

            // mark all unread as read
            await supabase
                .from("notifications")
                .update({ is_read: true })
                .eq("user_id", profile.id)
                .eq("is_read", false);

        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        } finally {
            setLoading(false);
        }
    }, [profile]);

    // ---------- FETCH WHEN OPEN ----------
    useEffect(() => {
        if (open) fetchNotifications();
    }, [open, fetchNotifications]);

    if (!open) return null;

    const grouped = groupNotifications(notifications);

    return (
        <>
            {/* Overlay */}
            <div className="notif-overlay" onClick={onClose}></div>

            {/* Sidebar */}
            <aside className="notif-sidebar">
                {/* Header */}
                <div className="notif-header">
                    <h2>Notifications</h2>

                    <button className="notif-close-btn" onClick={onClose}>
                        <X size={20} strokeWidth={1.5} />
                    </button>
                </div>

                {/* Content */}
                <div className="notif-content">
                    {/* Loading Skeleton */}
                    {loading && (
                        <div className="notif-skeleton-wrapper">
                            {[1, 2, 3, 4, 5, 6].map((item) => (
                                <div key={item} className="notif-skeleton-item">
                                    <div className="notif-skeleton-avatar shimmer"></div>

                                    <div className="notif-skeleton-text">
                                        <div className="notif-skeleton-line shimmer"></div>
                                        <div className="notif-skeleton-line small shimmer"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && notifications.length === 0 && (
                        <div className="notif-empty">
                            <p className="notif-empty-title">No notifications yet</p>
                            <p className="notif-empty-subtitle">
                                When someone likes, comments, or follows you, you’ll see it here.
                            </p>
                        </div>
                    )}

                    {/* Notifications */}
                    {!loading &&
                        notifications.length > 0 &&
                        Object.entries(grouped).map(([title, items]) => {
                            if (items.length === 0) return null;

                            return (
                                <div key={title} className="notif-group">
                                    <p className="notif-group-title">{title}</p>

                                    {items.map((n) => (
                                        <div
                                            key={n.id}
                                            className={`notif-item ${n.is_read ? "" : "unread"}`}
                                        >
                                            {/* Avatar */}
                                            {n.actor?.avatar_url ? (
                                                <img
                                                    src={n.actor?.avatar_url}
                                                    alt="User"
                                                    className="notif-avatar-img"
                                                />
                                            ) : (
                                                <div className="notif-avatar"></div>
                                            )}


                                            {/* Message */}
                                            <div className="notif-text">
                                                <p className="notif-message">
                                                    <span className="notif-username">
                                                        {n.actor?.username + " " || "Someone "}
                                                    </span>

                                                    {n.message}
                                                </p>

                                                <p className="notif-time">
                                                    {new Date(n.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                </div>
            </aside>
        </>
    );
}

export default NotificationsSidebar;
