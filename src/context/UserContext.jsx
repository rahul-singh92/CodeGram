import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import GlobalLoader from "../components/GlobalLoader";

const UserContext = createContext(null);

const MIN_LOADER_TIME = 1500;

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const startTime = Date.now();

    // ✅ ALWAYS resolve loader once auth state is known
    const resolveLoader = () => {
      const elapsed = Date.now() - startTime;
      const remaining = MIN_LOADER_TIME - elapsed;

      setTimeout(() => {
        if (mounted) setLoading(false);
      }, Math.max(0, remaining));
    };

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;

      const session = data.session;

      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }

      resolveLoader();
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    async function fetchProfile(userId) {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (mounted) setProfile(data);
      } catch (err) {
        console.error("Profile fetch failed:", err);
        if (mounted) setProfile(null);
      }
    }

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ✅ Loader ONLY depends on auth resolution
  if (loading) {
    return <GlobalLoader />;
  }

  return (
    <UserContext.Provider value={{ user, profile, setProfile }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser must be used inside UserProvider");
  }
  return ctx;
};
