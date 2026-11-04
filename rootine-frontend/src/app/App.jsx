import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "./providers/AuthProvider.jsx";
import { ThemeProvider } from "./providers/ThemeProvider.jsx";
import { useTheme } from "./contexts/theme.context.js";
import { GuestRoute, ProtectedRoute } from "./router/ProtectedRoute.jsx";
import AppShell from "./layout/AppShell.jsx";

import LandingPage from "../pages/Landing/LandingPage.jsx";
import Login from "../pages/Auth/Login.jsx";
import Register from "../pages/Auth/Register.jsx";
import Today from "../pages/Today/Today.jsx";
import Routines from "../pages/Routines/Routines.jsx";
import RoutineDetail from "../pages/Routine/RoutineDetail.jsx";
import Profile from "../pages/Profile/Profile.jsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: true,
      // Don't retry "not found" / "unauthorized"
      retry: (count, error) => count < 2 && !(error?.response?.status >= 400 && error.response.status < 500),
    },
  },
});

// Toasts follow the in-app theme choice, not just the OS setting
function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return <Toaster position="bottom-right" theme={resolvedTheme} richColors closeButton toastOptions={{ className: "font-sans" }} />;
}

// Old URLs from the previous UI
function LegacyRoutineRedirect() {
  const { id } = useParams();
  return <Navigate to={`/routines/${id}`} replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<GuestRoute><LandingPage /></GuestRoute>} />
              <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
              <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

              <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
                <Route path="/today" element={<Today />} />
                <Route path="/routines" element={<Routines />} />
                <Route path="/routines/:id" element={<RoutineDetail />} />
                <Route path="/profile" element={<Profile />} />
              </Route>

              <Route path="/dashboard" element={<Navigate to="/today" replace />} />
              <Route path="/user" element={<Navigate to="/profile" replace />} />
              <Route path="/routine/:id" element={<LegacyRoutineRedirect />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
          <ThemedToaster />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
