import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import {
  Command,
  Users,
  Wrench,
  Boxes,
  Calculator,
  LogOut,
} from "lucide-react";

// --- UTILIDADES ---

// Iniciales del avatar
const getInitials = (name = "") => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (first + last).toUpperCase();
};

// --- COMPONENTES INTERNOS ---

const RoleBadge = ({ role }) => {
  // Normalizamos a minúsculas
  const r = (role || "").toLowerCase();

  let styles = "";
  let label = "";

  switch (r) {
    case "admin":
      styles = "bg-blue-50 text-blue-700 ring-1 ring-blue-200";
      label = "Admin";
      break;
    case "contador":
      // Color Esmeralda (verde financiero) para contadores
      styles = "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
      label = "Contador";
      break;
    default:
      // Gris para usuarios normales
      styles = "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
      label = "Usuario";
      break;
  }

  return (
    <span
      className={`ml-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${styles}`}
    >
      {label}
    </span>
  );
};

const BentoCard = ({ title, desc, icon: Icon, onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group relative w-full text-left rounded-3xl p-6 md:p-7 bg-white ring-1 ring-black/5 shadow hover:shadow-md transition-all duration-200 ${
        disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center ring-1 ring-blue-100">
              <Icon size={22} strokeWidth={1.6} />
            </div>
            <h3 className="text-base md:text-lg font-semibold text-slate-900">
              {title}
            </h3>
          </div>
          <p className="mt-3 text-sm text-slate-500 leading-relaxed">{desc}</p>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600">
          <Command size={18} strokeWidth={1.6} />
        </div>
      </div>

      {!disabled && (
        <div className="mt-5 text-sm font-semibold text-[#007AFF] group-hover:underline underline-offset-4">
          Entrar
        </div>
      )}
    </button>
  );
};

// --- PÁGINA PRINCIPAL ---

const DashboardPage = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("inicio"); // "inicio" | "modulos"

  // Definición de Módulos + Permisos
  const modules = useMemo(
    () => [
      {
        key: "usuarios",
        title: "Gestión de Usuarios",
        desc: "Administra cuentas, roles y permisos.",
        icon: Users,
        to: "/usuarios",
        allowed: (r) => r === "admin",
      },
      {
        key: "mantenimiento",
        title: "Mantenimiento",
        desc: "Órdenes, planes preventivos y bitácoras.",
        icon: Wrench,
        to: "/mantenimiento",
        allowed: (r) => r === "admin" || r === "user",
      },
      {
        key: "activos",
        title: "Activos",
        desc: "Inventario, estados y ciclo de vida.",
        icon: Boxes,
        to: "/activos",
        allowed: (r) => r === "admin" || r === "user" || r === "contador",
      },
      {
        key: "contabilidad",
        title: "Contabilidad",
        desc: "Costos, presupuestos y reportes.",
        icon: Calculator,
        to: "/contabilidad",
        allowed: (r) => r === "admin" || r === "contador",
      },
    ],
    []
  );

  const normalizedRole = (role || "user").toLowerCase();

  // Filtramos solo los módulos permitidos para el usuario actual
  const visible = modules.filter((m) => m.allowed(normalizedRole));

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const initials = getInitials(user?.name || user?.username || "Usuario");

  return (
    <div className="min-h-screen bg-[#F2F2F7] p-4 sm:p-6 md:p-10 text-slate-900">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-200 flex items-center justify-center text-lg font-bold">
              {initials}
            </div>
            <div>
              <div className="flex items-center">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  ¡Hola, {user?.name || user?.username || "Usuario"}!
                </h1>
                {/* Aquí usamos el badge actualizado */}
                <RoleBadge role={role} />
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Bienvenido al sistema distribuido.
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 bg-white ring-1 ring-black/5 shadow hover:shadow-md text-slate-700 hover:text-slate-900 transition-all"
          >
            <LogOut size={18} />
            <span className="text-sm font-semibold">Cerrar sesión</span>
          </button>
        </div>

        {/* Hero */}
        <div className="mt-8 rounded-[2rem] bg-white p-6 sm:p-8 ring-1 ring-black/5 shadow">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 flex items-center justify-center mb-4">
            <Command size={26} strokeWidth={1.6} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Panel de Inicio</h2>
          <p className="mt-2 text-slate-500">
            Todo lo que necesitas, en un solo lugar. Navega por los módulos y continúa donde lo dejaste.
          </p>

          {/* Tabs */}
          <div className="mt-6 flex items-center gap-2">
            <button
              onClick={() => setTab("inicio")}
              className={`px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                tab === "inicio"
                  ? "bg-[#007AFF] text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Inicio
            </button>
            <button
              onClick={() => setTab("modulos")}
              className={`px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                tab === "modulos"
                  ? "bg-[#007AFF] text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Módulos
            </button>
          </div>
        </div>

        {/* Contenido por Tab */}
        {tab === "inicio" ? (
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="rounded-3xl bg-white p-6 ring-1 ring-black/5 shadow">
              <h3 className="text-sm font-semibold text-slate-500">Sugerido</h3>
              <p className="mt-2 text-slate-900 font-medium">
                Revisa tus órdenes de mantenimiento pendientes.
              </p>
              <button
                onClick={() => navigate("/mantenimiento")}
                className="mt-4 inline-flex items-center gap-2 text-[#007AFF] font-semibold text-sm hover:underline underline-offset-4"
              >
                Ir a Mantenimiento
              </button>
            </div>

            <div className="rounded-3xl bg-white p-6 ring-1 ring-black/5 shadow">
              <h3 className="text-sm font-semibold text-slate-500">Atajos</h3>
              <div className="mt-3 flex flex-wrap gap-3">
                {visible.map((m) => (
                  <button
                    key={m.key}
                    disabled={m.disabled}
                    onClick={() => !m.disabled && navigate(m.to)}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-2xl ring-1 ring-black/5 bg-slate-50 hover:bg-slate-100 transition ${
                      m.disabled ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                  >
                    <m.icon size={16} />
                    <span className="text-sm font-medium">{m.title}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 ring-1 ring-black/5 shadow">
              <h3 className="text-sm font-semibold text-slate-500">Novedades</h3>
              <p className="mt-2 text-slate-900 font-medium">
                Nueva vista de activos con filtros avanzados.
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Explora y acelera tus búsquedas.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {visible.map((m) => (
              <BentoCard
                key={m.key}
                title={m.title}
                desc={m.desc}
                icon={m.icon}
                disabled={m.disabled}
                onClick={() => !m.disabled && navigate(m.to)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;