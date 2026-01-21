import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiAuth } from "../../../core/api/axios"; // Asegúrate que la ruta sea correcta
import { useAuth } from "../../auth/context/AuthContext";
// 1. IMPORTAR EL COMPONENTE DE GOOGLE
import { GoogleLogin } from '@react-oauth/google'; 
import {
  Lock,
  User,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";

// (Ya no necesitamos el componente GoogleIcon manual, la librería trae el suyo)

const LoginPage = () => {
  const navigate = useNavigate();

  // Hook de autenticación seguro
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

  // --- 2. LÓGICA DE ÉXITO DE GOOGLE ---
  const handleGoogleSuccess = async (credentialResponse) => {
    console.log("Credencial de Google recibida:", credentialResponse);
    setLoading(true);
    setError("");

    try {
      // Enviamos el token "credential" al backend .NET
      // El backend validará la firma y nos devolverá NUESTRO token
      const response = await apiAuth.post("/usuarios/google-login", {
        Credential: credentialResponse.credential
      });

      console.log("Respuesta del Backend:", response.data);
      const { token } = response.data;

      if (token) {
        // Guardamos sesión y redirigimos
        auth.login(token); 
        navigate("/dashboard", { replace: true });
      } else {
        setError("El servidor no devolvió un token de sesión.");
      }
      
    } catch (err) {
      console.error("Error Login Google:", err);
      setError("Error al autenticar con Google. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIN TRADICIONAL ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        Username: form.username,
        Password: form.password,
      };

      const response = await apiAuth.post("/usuarios/login", payload);
      const { token } = response.data;

      if (token) {
        auth.login(token); 
        navigate("/dashboard", { replace: true });
      } else {
        setError("El servidor no devolvió un token válido.");
      }
      
    } catch (err) {
      console.error(err);
      if (err?.code === "ERR_NETWORK") {
        setError("No se pudo conectar con el servidor.");
      } else if (err.response?.status === 401) {
        setError("Credenciales incorrectas.");
      } else {
        setError("Ocurrió un error inesperado.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC] font-sans text-slate-900 relative overflow-hidden">
      
      {/* Fondos decorativos */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-violet-200/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-indigo-200/40 rounded-full blur-[100px] pointer-events-none" />

      {/* Tarjeta Principal */}
      <div className="w-full max-w-[440px] bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-violet-900/10 p-8 sm:p-12 relative z-10 border border-white/50">
        
        {/* Encabezado */}
        <div className="mb-8 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-violet-500/30 transform rotate-3">
            <ShieldCheck className="text-white" size={32} strokeWidth={2} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            Bienvenido
          </h2>
          <p className="text-slate-500 text-sm mt-2">
            Sistema de Gestión Distribuido
          </p>
        </div>

        {/* 3. AQUÍ ESTÁ EL CAMBIO: Botón Oficial de Google */}
        <div className="w-full flex justify-center">
             <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Falló la conexión con Google")}
                theme="outline"     // Puede ser 'filled_blue' o 'outline'
                size="large"        // Tamaño del botón
                shape="pill"        // Bordes redondeados
                width="350"         // Ancho forzado para que coincida con tu diseño
                text="continue_with"
                locale="es"         // Español
             />
        </div>

        {/* Divisor */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#fffbfd] px-3 text-slate-400 font-medium tracking-wider">
              o ingresa con tu correo
            </span>
          </div>
        </div>

        {/* Formulario Tradicional */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Input Usuario */}
          <div className="group space-y-1.5">
            <label className="text-xs font-bold text-slate-500 ml-1 uppercase">Usuario</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-600 transition-colors">
                <User size={20} strokeWidth={1.5} />
              </div>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 focus:bg-white transition-all duration-200 text-sm font-medium"
                placeholder="ej. admin"
                autoComplete="username"
                required
              />
            </div>
          </div>

          {/* Input Contraseña */}
          <div className="group space-y-1.5">
            <label className="text-xs font-bold text-slate-500 ml-1 uppercase">Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-600 transition-colors">
                <Lock size={20} strokeWidth={1.5} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 focus:bg-white transition-all duration-200 text-sm font-medium"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-600 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Mensaje de Error */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-medium flex items-center animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* Botón Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-4 px-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-[15px] font-bold rounded-2xl shadow-lg shadow-violet-500/30 transform transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={22} />
            ) : (
              <>
                Ingresar al Sistema
                <ArrowRight size={18} className="ml-2 opacity-80" strokeWidth={2.5} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400 font-medium">
            &copy; 2026 Seguridad Avanzada &bull; v2.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;