import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { fetchMe } from "../../services/api/auth.service.js";
import { TOKEN_KEY } from "../../services/api/httpClient.js";
import { AuthContext } from "../contexts/auth.context.js";

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)));

  // Restore the session from a stored token
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    fetchMe()
      .then(setUser)
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    // Don't leave the previous user's data in memory
    queryClient.clear();
  }, [queryClient]);

  // The HTTP client signals when the server rejects the token
  useEffect(() => {
    window.addEventListener("auth:expired", logout);
    return () => window.removeEventListener("auth:expired", logout);
  }, [logout]);

  const login = useCallback((token, userData) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(userData);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout, setUser }),
    [user, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
