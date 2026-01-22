import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import {
  Command,
  Users,
  Wrench,
  Boxes,
  Calculator,
  LogOut,
  Bell,
  Search,
  Calendar,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

// --- UTILIDADES ---

const getInitials = (name = "") => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (first + last).toUpperCase();
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 18) return "Buenas tardes";
  return "Buenas noches";
};

// --- COMPONENTES INTERNOS ---

const RoleBadge = ({ role }) => {
  const r = (role || "").toLowerCase();
  let styles = "";
  let label = "";
  let dotColor = "";

  switch (r) {
    case "admin":
      styles = "bg-violet-100 text-violet-700 border-violet-200";
      dotColor = "bg-violet-500";
      label = "Administrador";
      break;
    case "contador":
      styles = "bg-emerald-100 text-emerald-700 border-emerald-200";
      dotColor = "bg-emerald-500";
      label = "Contador";
      break;
    default:
      styles = "bg-slate-100 text-slate-600 border-slate-200";
      dotColor = "bg-slate-400";
      label = "Usuario";
      break;
  }

  return (
    <span
      className={`ml-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${styles} transition-colors`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse`} />
      {label}
    </span>
  );
};

// Tarjeta Bento Genérica (Para Módulos)
const BentoCard = ({ title, desc, icon: Icon, onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group relative w-full text-left h-full flex flex-col justify-between rounded-[2rem] p-6 transition-all duration-300 ${
        disabled
          ? "bg-slate-50 opacity-60 cursor-not-allowed border border-slate-100"
          : "bg-white hover:shadow-xl hover:shadow-violet-500/5 hover:-translate-y-1 border border-transparent hover:border-violet-100 cursor-pointer"
      }`}
    >
      <div>
        <div className="flex items-start justify-between mb-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
              disabled
                ? "bg-slate-100 text-slate-400"
                : "bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white"
            }`}
          >
            <Icon size={24} strokeWidth={1.5} />
          </div>
          {!disabled && (
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-violet-400 transform translate-x-2 group-hover:translate-x-0">
              <ArrowUpRight size={20} />
            </div>
          )}
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
      </div>
    </button>
  );
};

// --- PÁGINA PRINCIPAL ---

const DashboardPage = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("inicio");
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const options = { weekday: "long", day: "numeric", month: "long" };
    setCurrentDate(new Date().toLocaleDateString("es-ES", options));
  }, []);

  const modules = useMemo(
    () => [
      {
        key: "usuarios",
        title: "Gestión de Usuarios",
        desc: "Control de acceso, roles y seguridad.",
        icon: Users,
        to: "/usuarios",
        allowed: (r) => r === "admin",
      },
      {
        key: "mantenimiento",
        title: "Mantenimiento",
        desc: "Órdenes de trabajo y planes preventivos.",
        icon: Wrench,
        to: "/mantenimiento",
        allowed: (r) => r === "admin" || r === "user",
      },
      {
        key: "activos",
        title: "Activos Fijos",
        desc: "Inventario, depreciación y trazabilidad.",
        icon: Boxes,
        to: "/activos",
        allowed: (r) => r === "admin" || r === "user" || r === "contador",
      },
      {
        key: "contabilidad",
        title: "Contabilidad",
        desc: "Balance general, costos y reportes.",
        icon: Calculator,
        to: "/contabilidad",
        allowed: (r) => r === "admin" || r === "contador",
      },
    ],
    []
  );

  const normalizedRole = (role || "user").toLowerCase();
  const visible = modules.filter((m) => m.allowed(normalizedRole));

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const initials = getInitials(user?.name || user?.username || "Usuario");

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-sans selection:bg-violet-200">
      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-violet-50/50 to-transparent pointer-events-none" />

      <div className="relative mx-auto max-w-7xl p-4 sm:p-6 lg:p-10">
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-5">
            <div className="relative group cursor-pointer">
              <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-violet-200 transition-transform group-hover:scale-105">
                {initials}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-[#F8F9FC] rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {getGreeting()}, {user?.name?.split(" ")[0] || "Usuario"}
                </h1>
                <RoleBadge role={role} />
              </div>
              <p className="text-slate-500 flex items-center gap-2 text-sm font-medium">
                <Calendar size={14} className="text-violet-500" />
                <span className="capitalize">{currentDate}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-3 rounded-2xl bg-white text-slate-400 hover:text-violet-600 hover:bg-violet-50 hover:shadow-md transition-all">
              <Bell size={20} />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-slate-600 font-semibold hover:bg-red-50 hover:text-red-600 hover:shadow-md transition-all border border-transparent hover:border-red-100"
            >
              <LogOut size={18} />
              <span>Salir</span>
            </button>
          </div>
        </header>

        {/* --- NAV TABS --- */}
        <div className="mb-8 flex justify-center md:justify-start">
          <div className="inline-flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
            {["inicio", "modulos"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 capitalize ${
                  tab === t
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* --- CONTENIDO --- */}
        {tab === "inicio" ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(180px,auto)]">
            {/* Tarjeta Principal (Hero) - Ocupa más espacio */}
            <div className="md:col-span-8 bg-gradient-to-br from-violet-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-violet-200 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles size={120} />
              </div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium mb-4">
                    <Sparkles size={12} /> Novedades v2.0
                  </div>
                  <h2 className="text-3xl font-bold mb-2">
                    Bienvenido de vuelta
                  </h2>
                  <p className="text-violet-100 max-w-md">
                    Tienes 3 órdenes de mantenimiento pendientes y 2 reportes
                    listos para descargar.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/mantenimiento")}
                  className="w-max mt-6 px-6 py-3 rounded-xl bg-white text-violet-700 font-bold text-sm hover:bg-violet-50 transition-colors flex items-center gap-2 shadow-lg shadow-violet-900/20"
                >
                  Ir a Mantenimiento <ArrowUpRight size={16} />
                </button>
              </div>
            </div>

            {/* Tarjeta Lateral 1 - Sugerido */}
            <div className="md:col-span-4 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-4">
                  <Command size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Acciones Rápidas</h3>
                <p className="text-sm text-slate-500 mt-1">Atajos frecuentes</p>
              </div>
              <div className="space-y-2 mt-4">
                {visible.slice(0, 2).map((m) => (
                  <button
                    key={m.key}
                    onClick={() => navigate(m.to)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-amber-50 hover:text-amber-700 transition-colors text-sm font-medium text-slate-600 group"
                  >
                    <span className="flex items-center gap-2">
                      <m.icon size={16} /> {m.title}
                    </span>
                    <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>

            {/* Fila Inferior - Grid de 3 */}
            <div className="md:col-span-4 bg-emerald-50 rounded-[2.5rem] p-8 border border-emerald-100 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-emerald-900">Estado del Sistema</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <div className="text-3xl font-bold text-emerald-700 mb-1">98%</div>
              <p className="text-sm text-emerald-600">Operatividad esta semana</p>
            </div>

            <div className="md:col-span-8 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex items-center justify-between group cursor-pointer hover:border-violet-200 transition-all">
               <div>
                  <h3 className="text-lg font-bold text-slate-900">Buscador Global</h3>
                  <p className="text-sm text-slate-500">Encuentra usuarios, activos o reportes.</p>
               </div>
               <div className="w-12 h-12 rounded-full bg-slate-50 group-hover:bg-violet-600 group-hover:text-white flex items-center justify-center transition-all">
                  <Search size={20} />
               </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {visible.map((m) => (
              <div key={m.key} className="h-64">
                <BentoCard
                  title={m.title}
                  desc={m.desc}
                  icon={m.icon}
                  disabled={m.disabled}
                  onClick={() => !m.disabled && navigate(m.to)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;