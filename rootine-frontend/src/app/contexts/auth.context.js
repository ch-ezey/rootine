import { createContext, useContext } from "react";

/**
 * Dedicated module for AuthContext to satisfy:
 * eslint react-refresh/only-export-components
 */
export const AuthContext = createContext(null);

/** { user, loading, login(token, user), logout(), setUser(user) } */
export const useAuth = () => useContext(AuthContext);
