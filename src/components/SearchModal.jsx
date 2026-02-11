import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faMagnifyingGlass, faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import "../styles/searchModal.css";

function SearchModal({ open, onClose }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (!open) {
            setQuery("");
            setResults([]);
        }
    }, [open]);

    const handleSearch = async (text) => {
        setQuery(text);

        if (!text.trim()) {
            setResults([]);
            return;
        }

        setLoading(true);

        const { data, error } = await supabase
            .from("profiles")
            .select("id, username, full_name, avatar_url, is_private")
            .ilike("username", `%${text}%`)
            .limit(10);

        if (error) {
            console.log("Search error:", error.message);
            setResults([]);
        } else {
            setResults(data || []);
        }

        setLoading(false);
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
                        onChange={(e) => handleSearch(e.target.value)}
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

                {/* RECENT */}
                <div className="search-recent">
                    <div className="search-recent-header">Recent</div>

                    {!query.trim() && (
                        <p className="search-no-recent">No recent searches.</p>
                    )}

                    {/* RESULTS */}
                    {query.trim() && (
                        <div className="search-results">
                            {loading && <p className="search-loading">Searching...</p>}

                            {!loading && results.length === 0 && (
                                <p className="search-no-results">No users found.</p>
                            )}

                            {!loading &&
                                results.map((user) => (
                                    <div
                                        key={user.id}
                                        className="search-user-row"
                                        onClick={() => {
                                            onClose();
                                            navigate(`/user/${user.username}`);
                                        }}
                                    >
                                        <img
                                            src={user.avatar_url || ""}
                                            alt="avatar"
                                            className="search-user-avatar"
                                        />

                                        <div className="search-user-info">
                                            <div className="search-user-username">{user.username}</div>
                                            <div className="search-user-fullname">{user.full_name}</div>
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
