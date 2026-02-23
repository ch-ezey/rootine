import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  Outlet,
} from "react-router-dom";
import { AuthProvider } from "./providers/AuthProvider";
import ProtectedRoute from "./router/ProtectedRoute";

import Login from "../pages/Auth/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Routine from "../pages/Routine/Routine";
import "../shared/styles/App.css";
import Register from "../pages/Auth/Register";
import LandingPage from "../pages/Landing/LandingPage";
import User from "../pages/User/User";

function AppShell() {
  return (
    <div className="app-shell">
      <header className="top-nav">
        <nav className="top-nav__inner" aria-label="Primary">
          {/* Left: Brand */}
          <div className="top-nav__left">
            <Link to="/dashboard" className="top-nav__brand">
              Rootine
            </Link>
          </div>

          {/* Middle: Primary links */}
          <div className="top-nav__center">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/calendar">Calendar</Link>
            <Link to="/context">Context</Link>
            <Link to="/user">User</Link>
          </div>

          {/* Right: Settings (placeholder) */}
          <div className="top-nav__right">
            <Link
              to="/settings"
              aria-label="Settings"
              title="Settings"
              className="top-nav__settings"
            >
              Settings
            </Link>
          </div>
        </nav>
      </header>

      <main className="app-shell__content">
        <Outlet />
      </main>
    </div>
  );
}

// Skeleton pages (MVP placeholders)
function CalendarPage() {
  return (
    <div className="container">
      <h1>Calendar</h1>
      <p>Overview of tasks/routine for day/week/month (toggle coming next).</p>
    </div>
  );
}

function ContextPage() {
  return (
    <div className="container">
      <h1>Context</h1>
      <p>(Empty for now) Future user context functionality will live here.</p>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="container">
      <h1>Settings</h1>
      <p>(Placeholder) Settings page will be implemented later.</p>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected area with top navigation */}
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/user" element={<User />} />
            <Route path="/context" element={<ContextPage />} />
            <Route path="/settings" element={<SettingsPage />} />

            {/* Existing routine page remains protected */}
            <Route path="/routine/:id" element={<Routine />} />

            {/* Default inside protected shell */}
            <Route path="/app" element={<Navigate to="/dashboard" replace />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
