import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/auth.context.js";
import { FullPageSpinner } from "../../shared/ui/FullPageSpinner.jsx";

/** Signed-in area: sends visitors to login, remembering where they were going. */
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

/** Login/register/landing: signed-in users go straight to the app. */
export function GuestRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <FullPageSpinner />;
  if (user) return <Navigate to="/today" replace />;
  return children;
}
