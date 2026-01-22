import { Link } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";

export default function BackToHomeButton({ to = "/dashboard", className = "" }) {
  return (
    <Link
      to={to}
      className={`
        group inline-flex items-center gap-2 px-4 py-2.5 
        rounded-2xl text-sm font-semibold transition-all duration-200
        active:scale-95 border
        ${className ? className : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 shadow-sm"}
      `}
      aria-label="Regresar a inicio"
    >
      <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
      <span>Regresar</span>
    </Link>
  );
}