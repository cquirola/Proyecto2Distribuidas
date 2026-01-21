
// src/components/BackToHomeButton.jsx
import { Link } from "react-router-dom";

export default function BackToHomeButton({ to = "/dashboard", className = "" }) {
  return (
    <Link
      to={to}
      className={
        `inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition ${className}`
      }
      aria-label="Regresar a inicio"
    >
      ← Regresar a inicio
    </Link>
  );
}
