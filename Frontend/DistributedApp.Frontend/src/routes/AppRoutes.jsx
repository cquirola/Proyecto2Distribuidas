import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage";
import TipoActivosPage from "../features/assets/pages/TipoActivosPage";
import ActivosPage from "../features/assets/pages/ActivosPage";

const AppRoutes = () => {
  const hasUser = !!localStorage.getItem("user");

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={<Navigate to={hasUser ? "/assets/tipos" : "/login"} replace />}
      />

      {/* RUTAS DE ACTIVOS */}
      <Route path="/assets/tipos" element={<TipoActivosPage />} />
      <Route path="/assets/activos" element={<ActivosPage />} />

      <Route
        path="*"
        element={<Navigate to={hasUser ? "/assets/tipos" : "/login"} replace />}
      />
    </Routes>
  );
};

export default AppRoutes;
