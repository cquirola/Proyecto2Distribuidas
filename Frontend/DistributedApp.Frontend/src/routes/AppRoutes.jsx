import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Ruta por defecto: Redirigir al Login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* Ruta del Login */}
      <Route path="/login" element={<LoginPage />} />

      {/* Cualquier ruta desconocida te manda al Login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;