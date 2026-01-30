import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import GlobalLoader from "../components/GlobalLoader";

const UserContext = createContext(null);

const MIN_LOADER_TIME = 1500; // 1.5s smooth loader

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const startTime = Date.now();

    const fetchProfile = async (userId) => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (isMounted) setProfile(data);
    };

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      }

      const elapsed = Date.now() - startTime;
      const remaining = MIN_LOADER_TIME - elapsed;

      setTimeout(() => {
        if (isMounted) setLoading(false);
      }, Math.max(0, remaining));
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        setUser(null);
        setProfile(null);
        return;
      }

      setUser(session.user);
      await fetchProfile(session.user.id);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

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
