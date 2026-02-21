import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faXmark,
    faMagnifyingGlass,
    faCircleXmark,
    faUser
} from "@fortawesome/free-solid-svg-icons";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import "../styles/searchModal.css";

function SearchModal({ open, onClose }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // Clear search when modal closes
    useEffect(() => {
        if (!open) {
            setQuery("");
            setResults([]);
        }
    }, [open]);

    // Load recent from Supabase when modal opens
    useEffect(() => {
        if (open) {
            fetchRecent();
        }
    }, [open]);

    // Debounced Search
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (query.trim()) {
                searchUsers(query.trim());
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [query]);

    // Search Function
    const searchUsers = async (text) => {
        setLoading(true);

        const { data, error } = await supabase
            .from("profiles")
            .select("id, username, full_name, avatar_url, is_private")
            .or(`username.ilike.%${text}%,full_name.ilike.%${text}%`)
            .limit(8);

        if (error) {
            console.log("Search error:", error.message);
            setResults([]);
        } else {
            setResults(data || []);
        }

        setLoading(false);
    };

    const fetchRecent = async () => {
        const { data: authData } = await supabase.auth.getUser();
        if (!authData?.user) return;

        const { data, error } = await supabase
            .from("recent_searches")
            .select(`
            searched_user:profiles!recent_searches_searched_user_id_fkey (
                id,
                username,
                full_name,
                avatar_url
            )
        `)
            .eq("user_id", authData.user.id)
            .order("created_at", { ascending: false })
            .limit(5);

        if (!error && data) {
            setRecentSearches(data.map(item => item.searched_user));
        }
    };

    const addToRecent = async (user) => {
        const { data: authData } = await supabase.auth.getUser();
        if (!authData?.user) return;

        await supabase
            .from("recent_searches")
            .upsert({
                user_id: authData.user.id,
                searched_user_id: user.id
            });

        fetchRecent();
    };

    const deleteRecent = async (searchedUserId) => {
        const { data: authData } = await supabase.auth.getUser();

        await supabase
            .from("recent_searches")
            .delete()
            .eq("user_id", authData.user.id)
            .eq("searched_user_id", searchedUserId);

        fetchRecent();
    };

    const clearAllRecent = async () => {
        const { data: authData } = await supabase.auth.getUser();

        await supabase
            .from("recent_searches")
            .delete()
            .eq("user_id", authData.user.id);

        setRecentSearches([]);
    };

    if (!open) return null;

    return (
        <div className="search-overlay" onClick={onClose}>
            <div className="search-modal" onClick={(e) => e.stopPropagation()}>

                {/* HEADER */}
                <div className="search-header">
                    <h3>Search</h3>
                    <button className="search-close-btn" onClick={onClose}>
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>

                {/* SEARCH BAR */}
                <div className="search-bar">
                    <FontAwesomeIcon icon={faMagnifyingGlass} className="search-icon" />

                    <input
                        type="text"
                        placeholder="Search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />

                    {query.trim() && (
                        <button
                            className="search-clear-btn"
                            onClick={() => {
                                setQuery("");
                                setResults([]);
                            }}
                        >
                            <FontAwesomeIcon icon={faCircleXmark} />
                        </button>
                    )}
                </div>

                {/* RESULTS / RECENT */}
                <div className="search-recent">

                    <div className="search-recent-header">
                        {query.trim() ? "Results" : "Recent"}
                        {!query.trim() && recentSearches.length > 0 && (
                            <button className="clear-recent" onClick={clearAllRecent}>
                                Clear all
                            </button>
                        )}
                    </div>

                    {/* SHOW RECENT WHEN NO QUERY */}
                    {!query.trim() && (
                        <>
                            {recentSearches.length === 0 ? (
                                <p className="search-no-recent">
                                    No recent searches.
                                </p>
                            ) : (
                                recentSearches.map((user) => (
                                    <div key={user.id} className="search-user-row recent-row">

                                        <div
                                            className="recent-left"
                                            onClick={() => {
                                                onClose();
                                                navigate(`/user/${user.username}`);
                                            }}
                                        >
                                            {user.avatar_url ? (
                                                <img
                                                    src={user.avatar_url}
                                                    alt="avatar"
                                                    className="search-user-avatar"
                                                />
                                            ) : (
                                                <div className="search-user-avatar default-avatar">
                                                    <FontAwesomeIcon icon={faUser} />
                                                </div>
                                            )}

                                            <div className="search-user-info">
                                                <div className="search-user-username">
                                                    {user.username}
                                                </div>
                                                <div className="search-user-fullname">
                                                    {user.full_name}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            className="recent-delete"
                                            onClick={() => deleteRecent(user.id)}
                                        >
                                            <FontAwesomeIcon icon={faXmark} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </>
                    )}

                    {/* 🔥 SHOW SEARCH RESULTS */}
                    {query.trim() && (
                        <div className="search-results">

                            {loading && (
                                <p className="search-loading">Searching...</p>
                            )}

                            {!loading && results.length === 0 && (
                                <p className="search-no-results">
                                    No users found.
                                </p>
                            )}

                            {!loading &&
                                results.map((user) => (
                                    <div
                                        key={user.id}
                                        className="search-user-row"
                                        onClick={() => {
                                            addToRecent(user); // 👈 add to recent
                                            onClose();
                                            navigate(`/user/${user.username}`);
                                        }}
                                    >
                                        {user.avatar_url ? (
                                            <img
                                                src={user.avatar_url}
                                                alt="avatar"
                                                className="search-user-avatar"
                                            />
                                        ) : (
                                            <div className="search-user-avatar default-avatar">
                                                <FontAwesomeIcon icon={faUser} />
                                            </div>
                                        )}

                                        <div className="search-user-info">
                                            <div className="search-user-username">
                                                {user.username}
                                            </div>
                                            <div className="search-user-fullname">
                                                {user.full_name}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SearchModal;
