
import { useEffect, useMemo, useState } from "react";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleActive,
  // resetPassword, // si lo habilitas
} from "../api/usersApi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import {
  Command,
  UserPlus,
  Users,
  Mail,
  Shield,
  Search,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";

import BackToHomeButton from "../../dumbComponents/backToHomeButton";

// Debounce simple para búsquedas
const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

// Formulario de Crear/Editar Usuario (modal simple)
const UserForm = ({
  open,
  onClose,
  onSubmit,
  initialValues,
  loading,
}) => {
  const [form, setForm] = useState(
    initialValues || {
      NombreUsuario: "",
      Contrasena: "",
      NombreCompleto: "",
      Correo: "",
      Rol: "user",
      Activo: true,
    }
  );
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    if (initialValues) {
      setForm({
        NombreUsuario: initialValues.NombreUsuario || "",
        Contrasena: "", // por seguridad no rellenamos
        NombreCompleto: initialValues.NombreCompleto || "",
        Correo: initialValues.Correo || "",
        Rol: initialValues.Rol?.toLowerCase?.() || "user",
        Activo: !!initialValues.Activo,
      });
    } else {
      setForm({
        NombreUsuario: "",
        Contrasena: "",
        NombreCompleto: "",
        Correo: "",
        Rol: "user",
        Activo: true,
      });
    }
  }, [initialValues, open]);

  if (!open) return null;

  const isEdit = !!initialValues?.idUsuario;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const submit = (e) => {
    e.preventDefault();
    // Validación mínima
    if (!form.NombreUsuario?.trim()) return alert("Nombre de usuario es requerido");
    if (!isEdit && !form.Contrasena?.trim()) return alert("Contraseña es requerida");
    if (!form.NombreCompleto?.trim()) return alert("Nombre completo es requerido");
    if (!form.Correo?.trim()) return alert("Correo es requerido");
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-xl bg-white rounded-3xl ring-1 ring-black/5 shadow-xl overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 ring-1 ring-purple-200 flex items-center justify-center">
              <UserPlus size={18} />
            </div>
            <h3 className="text-lg font-bold tracking-tight">
              {isEdit ? "Editar usuario" : "Nuevo usuario"}
            </h3>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Completa los campos para {isEdit ? "actualizar" : "crear"} el usuario.
          </p>
        </div>

        <form onSubmit={submit} className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-sm font-medium text-slate-700">Nombre de usuario</label>
            <input
              name="NombreUsuario"
              value={form.NombreUsuario}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl bg-slate-100 border-0 px-4 py-3 focus:ring-2 focus:ring-purple-500/50 focus:bg-white"
              placeholder="usuario"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Correo</label>
            <input
              name="Correo"
              type="email"
              value={form.Correo}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl bg-slate-100 border-0 px-4 py-3 focus:ring-2 focus:ring-purple-500/50 focus:bg-white"
              placeholder="usuario@correo.com"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Nombre completo</label>
            <input
              name="NombreCompleto"
              value={form.NombreCompleto}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl bg-slate-100 border-0 px-4 py-3 focus:ring-2 focus:ring-purple-500/50 focus:bg-white"
              placeholder="Nombre y Apellido"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Rol</label>
            <select
              name="Rol"
              value={form.Rol}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl bg-slate-100 border-0 px-4 py-3 focus:ring-2 focus:ring-purple-500/50 focus:bg-white"
            >
              <option value="admin">Admin</option>
              <option value="user">Usuario</option>
              <option value="contador">Contador</option>
            </select>
          </div>

          {!isEdit && (
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Contraseña</label>
              <div className="mt-2 relative">
                <input
                  name="Contrasena"
                  type={showPwd ? "text" : "password"}
                  value={form.Contrasena}
                  onChange={handleChange}
                  className="w-full rounded-2xl bg-slate-100 border-0 px-4 py-3 pr-11 focus:ring-2 focus:ring-purple-500/50 focus:bg-white"
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600"
                  aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              id="activo"
              name="Activo"
              type="checkbox"
              checked={form.Activo}
              onChange={handleChange}
              className="h-4 w-4 accent-purple-600"
            />
            <label htmlFor="activo" className="text-sm font-medium text-slate-700">
              Activo
            </label>
          </div>

          <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-2xl bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60"
            >
              {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UsuariosPage = () => {
  const navigate = useNavigate();
  const { role } = useAuth(); // protegido por rutas, pero útil si quieres condicionar UI
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  // Filtros y estado UI
  const [usernameQ, setUsernameQ] = useState("");
  const [emailQ, setEmailQ] = useState("");
  const [roleQ, setRoleQ] = useState("all");
  const [statusQ, setStatusQ] = useState("all"); // all | active | inactive
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Modal
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Debounced queries
  const qUser = useDebounce(usernameQ, 350);
  const qMail = useDebounce(emailQ, 350);

  const purple = {
    primary: "#6D28D9",
    primaryHover: "#5B21B6",
  };

  const fetchList = async (opts = {}) => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page,
        size,
        username: qUser || undefined,
        email: qMail || undefined,
        role: roleQ !== "all" ? roleQ : undefined,
        activo:
          statusQ === "all" ? undefined : statusQ === "active" ? true : false,
        ...opts,
      };
      const data = await getUsers(params);
      setItems(Array.isArray(data.data) ? data.data : []);
      setTotal(Number(data.total || 0));
    } catch (e) {
      console.error(e);
      setError("No se pudo cargar la lista de usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qUser, qMail, roleQ, statusQ, page, size]);

  const resetFilters = () => {
    setUsernameQ("");
    setEmailQ("");
    setRoleQ("all");
    setStatusQ("all");
    setPage(1);
  };

  const onCreate = () => {
    setEditing(null);
    setOpenForm(true);
  };

  const onEdit = (row) => {
    setEditing(row);
    setOpenForm(true);
  };

  const onDelete = async (row) => {
    const ok = confirm(`¿Eliminar al usuario "${row.NombreUsuario}"?`);
    if (!ok) return;
    setDeletingId(row.idUsuario);
    try {
      await deleteUser(row.idUsuario);
      await fetchList();
    } catch (e) {
      alert("No se pudo eliminar. Intenta nuevamente.");
    } finally {
      setDeletingId(null);
    }
  };

  const onToggleActive = async (row) => {
    try {
      await toggleActive(row.idUsuario, !row.Activo);
      await fetchList();
    } catch (e) {
      alert("No se pudo cambiar el estado. Intenta nuevamente.");
    }
  };

  const handleSubmitForm = async (form) => {
    setSaving(true);
    try {
      if (editing?.idUsuario) {
        // Si Contrasena viene vacía, no la enviamos
        const payload = { ...form };
        if (!payload.Contrasena) delete payload.Contrasena;
        await updateUser(editing.idUsuario, payload);
      } else {
        await createUser(form);
      }
      setOpenForm(false);
      setEditing(null);
      await fetchList({ page: 1 }); // volver a primera página por UX
      setPage(1);
    } catch (e) {
      alert("No se pudo guardar. Revisa los datos e intenta nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  const summary = useMemo(() => {
    const activos = items.filter((i) => !!i.Activo).length;
    const inactivos = items.length - activos;
    return { activos, inactivos };
  }, [items]);

  return (
    <div className="min-h-screen bg-[#F2F2F7] p-4 sm:p-6 md:p-10 text-slate-900">
      <div className="mx-auto max-w-7xl">
        {/* Header / Título */}
        <div className="rounded-[2rem] bg-white p-6 sm:p-8 ring-1 ring-black/5 shadow">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 ring-1 ring-purple-200 flex items-center justify-center">
                <Users size={26} />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Gestión de Usuarios</h1>
                <p className="text-slate-500 mt-1">
                  Crea, edita y administra los usuarios del sistema.
                </p>
              </div>
            </div>

            {/* Acciones a la derecha */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setRefreshing(true);
                  fetchList().finally(() => setRefreshing(false));
                }}
                className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 bg-white ring-1 ring-black/5 shadow hover:shadow-md text-slate-700 hover:text-slate-900 transition-all"
                title="Refrescar"
              >
                <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
                <span className="text-sm font-semibold">Refrescar</span>
              </button>

              {/* Botón de regresar a inicio */}
              <BackToHomeButton
                to="/dashboard" // cambia a "/dashoboard" si esa es tu ruta real
                className="!bg-purple-600 hover:!bg-purple-700 !text-white"
              />
            </div>
          </div>

          {/* Bento actions */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-3xl p-5 bg-purple-50 ring-1 ring-purple-100 text-purple-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/80 flex items-center justify-center ring-1 ring-purple-100">
                  <Users size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-purple-700">TOTAL</p>
                  <p className="text-xl font-bold">{total}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl p-5 bg-green-50 ring-1 ring-green-100 text-green-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/80 flex items-center justify-center ring-1 ring-green-100">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-green-700">ACTIVOS</p>
                  <p className="text-xl font-bold">{summary.activos}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl p-5 bg-rose-50 ring-1 ring-rose-100 text-rose-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/80 flex items-center justify-center ring-1 ring-rose-100">
                  <XCircle size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-rose-700">INACTIVOS</p>
                  <p className="text-xl font-bold">{summary.inactivos}</p>
                </div>
              </div>
            </div>

            <button
              onClick={onCreate}
              className="rounded-3xl p-5 bg-white ring-1 ring-black/5 shadow hover:shadow-md text-slate-800 text-left transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center ring-1 ring-purple-200">
                  <UserPlus size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">ACCIÓN</p>
                  <p className="text-lg font-bold">Crear usuario</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="mt-6 rounded-3xl bg-white p-5 ring-1 ring-black/5 shadow">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Usuario</label>
              <div className="mt-2 relative">
                <input
                  value={usernameQ}
                  onChange={(e) => setUsernameQ(e.target.value)}
                  className="w-full rounded-2xl bg-slate-100 border-0 px-4 py-3 pl-10 focus:ring-2 focus:ring-purple-500/50 focus:bg-white"
                  placeholder="Buscar por usuario"
                />
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Correo</label>
              <div className="mt-2 relative">
                <input
                  value={emailQ}
                  onChange={(e) => setEmailQ(e.target.value)}
                  className="w-full rounded-2xl bg-slate-100 border-0 px-4 py-3 pl-10 focus:ring-2 focus:ring-purple-500/50 focus:bg-white"
                  placeholder="Buscar por correo"
                />
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Rol</label>
              <select
                value={roleQ}
                onChange={(e) => {
                  setRoleQ(e.target.value);
                  setPage(1);
                }}
                className="mt-2 w-full rounded-2xl bg-slate-100 border-0 px-4 py-3 focus:ring-2 focus:ring-purple-500/50 focus:bg-white"
              >
                <option value="all">Todos</option>
                <option value="admin">Admin</option>
                <option value="user">Usuario</option>
                <option value="contador">Contador</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Estado</label>
              <select
                value={statusQ}
                onChange={(e) => {
                  setStatusQ(e.target.value);
                  setPage(1);
                }}
                className="mt-2 w-full rounded-2xl bg-slate-100 border-0 px-4 py-3 focus:ring-2 focus:ring-purple-500/50 focus:bg-white"
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div className="mt-6 rounded-3xl bg-white ring-1 ring-black/5 shadow overflow-hidden">
          {error && (
            <div className="p-4 bg-rose-50 text-rose-700 text-sm">{error}</div>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-5 py-3">ID</th>
                  <th className="text-left px-5 py-3">Usuario</th>
                  <th className="text-left px-5 py-3">Nombre</th>
                  <th className="text-left px-5 py-3">Correo</th>
                  <th className="text-left px-5 py-3">Rol</th>
                  <th className="text-left px-5 py-3">Estado</th>
                  <th className="text-right px-5 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-slate-500">
                      Cargando...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10">
                      <div className="flex flex-col items-center justify-center gap-3 text-slate-500">
                        <p>No hay resultados</p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={resetFilters}
                            className="px-4 py-2 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200"
                          >
                            Limpiar filtros
                          </button>
                          <BackToHomeButton to="/dashboard" />
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map((row) => (
                    <tr key={row.idUsuario} className="border-t border-slate-100">
                      <td className="px-5 py-3">{row.idUsuario}</td>
                      <td className="px-5 py-3">{row.NombreUsuario}</td>
                      <td className="px-5 py-3">{row.NombreCompleto}</td>
                      <td className="px-5 py-3">{row.Correo}</td>
                      <td className="px-5 py-3 capitalize">{row.Rol}</td>
                      <td className="px-5 py-3">
                        {row.Activo ? (
                          <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 ring-1 ring-green-100 px-2.5 py-1 rounded-full">
                            <CheckCircle2 size={14} /> Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 ring-1 ring-rose-100 px-2.5 py-1 rounded-full">
                            <XCircle size={14} /> Inactivo
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onEdit(row)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200"
                            title="Editar"
                          >
                            <Pencil size={16} />
                            Editar
                          </button>
                          <button
                            onClick={() => onToggleActive(row)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-white ring-1 ring-black/5 hover:shadow"
                            title={row.Activo ? "Desactivar" : "Activar"}
                          >
                            {row.Activo ? "Desactivar" : "Activar"}
                          </button>
                          <button
                            onClick={() => onDelete(row)}
                            disabled={deletingId === row.idUsuario}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
            <div className="text-xs text-slate-500">
              Mostrando {(items.length && (page - 1) * size + 1) || 0}–
              {(page - 1) * size + items.length} de {total}
            </div>
            <div className="flex items-center gap-2">
              <select
                value={size}
                onChange={(e) => {
                  setSize(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-xl bg-slate-100 border-0 px-2 py-1 text-sm"
              >
                {[10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n} / pág
                  </option>
                ))}
              </select>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-xl bg-slate-100 disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="text-sm font-medium">Pág. {page}</span>
              <button
                onClick={() => setPage((p) => (p * size < total ? p + 1 : p))}
                disabled={page * size >= total}
                className="px-3 py-1.5 rounded-xl bg-slate-100 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Crear/Editar */}
      <UserForm
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setEditing(null);
        }}
        onSubmit={handleSubmitForm}
        initialValues={editing}
        loading={saving}
      />
    </div>
  );
};

export default UsuariosPage;

