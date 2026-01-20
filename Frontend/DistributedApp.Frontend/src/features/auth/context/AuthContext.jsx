
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

/**
 * Mantenemos la sesión SOLO en localStorage.
 * Estructura sugerida:
 * {
 *   isLoggedIn: true,
 *   name: "Michael",
 *   username: "michael",
 *   role: "admin" | "user"
 * }
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // null | { isLoggedIn, name, username, role }

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    } catch (_) {}
  }, []);

  const login = (userData) => {
    // userData debe traer al menos: name, username, role
    const session = {
      isLoggedIn: true,
      name: userData.name,
      username: userData.username,
      role: (userData.role || "user").toLowerCase(),
    };
    setUser(session);
    localStorage.setItem("user", JSON.stringify(session));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const value = useMemo(
    () => ({
      user,
      role: user?.role || "user",
      isAuthenticated: !!user?.isLoggedIn,
      login,
      logout,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
