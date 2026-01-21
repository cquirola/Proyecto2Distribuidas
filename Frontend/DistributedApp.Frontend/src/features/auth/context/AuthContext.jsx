import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode"; // <--- IMPORTANTE

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false); // Para evitar parpadeos al cargar

  // Función auxiliar para normalizar los datos del Token
  // Porque .NET usa nombres de claims muy largos (URLs)
  const decodificarToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      
      // Mapeo de Claims de .NET a nombres cortos
      const rolClaim = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
      const nameClaim = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name";
      const idClaim = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";

      return {
        isLoggedIn: true,
        usuarioId: decoded[idClaim],
        name: decoded[nameClaim],
        username: decoded.sub || decoded[nameClaim], // A veces viene en 'sub'
        role: (decoded[rolClaim] || "user").toLowerCase(),
        token: token, // Guardamos el token para usarlo en peticiones
        exp: decoded.exp // Fecha de expiración
      };
    } catch (error) {
      console.error("Error al decodificar token:", error);
      return null;
    }
  };

  useEffect(() => {
    // Al cargar la app, buscamos si hay un token guardado
    const tokenGuardado = localStorage.getItem("token");
    
    if (tokenGuardado) {
      const sessionUsuario = decodificarToken(tokenGuardado);
      
      // Verificamos si el token no ha expirado
      const currentTime = Date.now() / 1000;
      if (sessionUsuario && sessionUsuario.exp > currentTime) {
        setUser(sessionUsuario);
      } else {
        // Si expiró, limpiamos todo
        localStorage.removeItem("token");
        setUser(null);
      }
    }
    setIsInitialized(true);
  }, []);

  const login = (token) => {
    // 1. Guardamos el token crudo en localStorage
    localStorage.setItem("token", token);
    
    // 2. Decodificamos para actualizar el estado de React
    const session = decodificarToken(token);
    setUser(session);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    // Opcional: Redirigir aquí o en el componente
  };

  const value = useMemo(
    () => ({
      user,
      role: user?.role || "user",
      token: user?.token, // Exponemos el token por si alguien lo necesita
      isAuthenticated: !!user?.isLoggedIn,
      login,
      logout,
    }),
    [user]
  );

  if (!isInitialized) return null; // O un <Loader /> pequeño

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);