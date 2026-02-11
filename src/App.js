import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import EditProfile from "./pages/settings/EditProfile";
import Notifications from "./pages/settings/Notifications";
import AccountPrivacy from "./pages/settings/AccountPrivacy";

import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES */}
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

        {/* PROTECTED ROUTES */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/user/:username" element={<Profile />} />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        >
          <Route index element={<EditProfile />} />
          <Route path="/settings/notifications" element={<Notifications />} />
          <Route path="/settings/privacy" element={<AccountPrivacy />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
