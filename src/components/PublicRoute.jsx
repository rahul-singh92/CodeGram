import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

function PublicRoute({ children }) {
  const { user, loading } = useUser();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return <Navigate to="/profile" replace />;
  }

  return children;
}

export default PublicRoute;
