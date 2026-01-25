import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import { supabase } from "./lib/supabase";
import { useEffect } from "react";
import { UserProvider } from "./context/UserContext";

import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {

  useEffect(() => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") {
      window.location.href = "/";
    }
  });

  return () => subscription.unsubscribe();
}, []);

  return (
    <BrowserRouter>
    <UserProvider>
      <Routes>

        {/* Public Routes */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

      </Routes>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
