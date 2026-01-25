import { useEffect } from "react";
// import { supabase } from "../lib/supabase";

function Feed() {
  useEffect(() => {
    document.title = "CodeGram • Feed";
  }, []);

  return (
    <div style={{ padding: "40px", color: "white" }}>
      <h1>Welcome to CodeGram Feed 🚀</h1>
      <p>Your posts will appear here.</p>
    </div>
  );
}

export default Feed;
