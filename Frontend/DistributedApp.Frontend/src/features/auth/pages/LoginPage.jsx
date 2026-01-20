
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiAuth } from "../../../core/api/axios";
import { useAuth } from "../../auth/context/AuthContext"; // si aún no lo tienes, este import puede comentarse
import {
  Lock,
  User,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  Command,
} from "lucide-react";

const LoginPage = () => {
  const navigate = useNavigate();

  // Si no tienes aún el AuthContext, puedes descomentar esta línea:
  // const useAuth = () => ({ login: undefined });
  const auth = (() => {
    try {
      return useAuth?.() || {};
    } catch {
      return {};
    }
  })();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({ username: "", password: "" });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  //lOGIN SIN BACKNED DE PRUEBA
  const handleSubmit_Extra = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const username = form.username.trim();
      const password = form.password.trim();

      // Validaciones mínimas de UX
      if (username.length < 3) {
        setError("El usuario debe tener al menos 3 caracteres.");
        return;
      }
      if (password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres.");
        return;
      }

      // Simulación de latencia
      await new Promise((r) => setTimeout(r, 450));

      if(password !== "123456"){
        setError("Contraseña provisoinal incorrecta");
        return

      }
      // Regla provisional:
      // - admin / 123456 => rol admin
      // - cualquier-otro / 123456 => rol user
      else if (password === "123456") {
        let resolvedRole  = "user"
        
        if (username === "admin") resolvedRole = "admin";
        if (username === "contador") resolvedRole = "contador";

       
        const session = {
            isLoggedIn: true,
            name: form.username,
            username: form.username,
            role: resolvedRole,
          };


        // Guarda en localStorage
        localStorage.setItem("user", JSON.stringify(session));

        // Si tienes AuthContext, úsalo también
        if (auth?.login) auth.login(session);

        console.log("Login Provisional exitoso");
        navigate("/dashboard", { replace: true });
      } else {
        setError("Usuario o contraseña incorrectos.");
      }
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error inesperado. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login REAL contra backend (cuando lo conectes)
   * - Si tu backend responde con { name, username, role }
   * - NO usamos token por ahora
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await apiAuth.post("/usuarios/login", form);

      // Ajusta esto al shape real de tu API:
      const session = {
        isLoggedIn: true,
        name: response.data?.name ?? form.username,
        username: response.data?.username ?? form.username,
        role: (response.data?.role ?? "user").toLowerCase(),
      };

      localStorage.setItem("user", JSON.stringify(session));
      if (auth?.login) auth.login(session);

      console.log("Login Exitoso:", response.data);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error(err);
      if (err?.code === "ERR_NETWORK") {
        setError("No se pudo conectar con el servidor. Revisa el Backend.");
      } else {
        setError("Usuario o contraseña incorrectos.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // Fondo gris claro limpio estilo iOS
    <div className="min-h-screen flex items-center justify-center bg-[#F2F2F7] p-4 font-sans text-slate-900">
      {/* Tarjeta Principal: Más limpia, sin borde superior de color */}
      <div className="w-full max-w-[420px] bg-white rounded-[2rem] shadow-xl ring-1 ring-black/5 p-8 sm:p-12 relative overflow-hidden">
        {/* --- NUEVO ENCABEZADO TIPO APPLE/MATERIAL --- */}
        <div className="mb-10 text-center">
          {/* Icono central limpio */}
          <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <Command className="text-blue-600" size={32} strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Acceder
          </h2>
          <p className="text-gray-500 text-sm mt-3 leading-relaxed">
            Ingresa tus credenciales para continuar al sistema distribuido.
          </p>
        </div>
        {/* ------------------------------------------- */}

        {/* IMPORTANTE: mientras no tengas backend, usa handleSubmit_Extra */}
        <form onSubmit={handleSubmit_Extra} className="space-y-6">
          {/* Input Usuario */}
          <div className="group">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                <User size={20} strokeWidth={1.5} />
              </div>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 bg-slate-100 border-0 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all duration-300 text-[15px] font-medium"
                placeholder="Usuario"
                autoComplete="username"
                required
              />
            </div>
          </div>

          {/* Input Contraseña */}
          <div className="group">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                <Lock size={20} strokeWidth={1.5} />
              </div>

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full pl-12 pr-12 py-4 bg-slate-100 border-0 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all duration-300 text-[15px] font-medium"
                placeholder="Contraseña"
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-4 top-4 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer outline-none"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? (
                  <EyeOff size={20} strokeWidth={1.5} />
                ) : (
                  <Eye size={20} strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-sm flex items-center font-medium">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 mr-2 shrink-0"
              >
                <path
                  fillRule="evenodd"
                  d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.401 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-4 px-6 bg-[#007AFF] hover:bg-[#006EDB] text-white text-[15px] font-semibold rounded-2xl shadow-sm hover:shadow-md transform transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={22} />
            ) : (
              <>
                Continuar{" "}
                <ArrowRight size={18} className="ml-2 opacity-80" strokeWidth={2} />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-xs text-gray-400 font-medium">
            &copy; 2024 Sistema Distribuido. Segurado con OAuth 2.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
