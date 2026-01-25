import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Sidebar from "../components/Sidebar";

function Settings() {
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", user.id)
        .single();

      setAvatarUrl(data?.avatar_url || null);
    };

    loadProfile();
  }, []);

  return (
    <div className="profile-page">
      <Sidebar avatarUrl={avatarUrl} />

      <main className="profile-content">
        <h1>Settings & Privacy</h1>
        <p>Random text for now…</p>
      </main>
    </div>
  );
}

export default Settings;
