import { useEffect, useMemo, useState } from "react";
import { apiAssets } from "../../../core/api/axios";
import { Search, Plus, Save, X, Trash2, Pencil } from "lucide-react";

export default function TipoActivosPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [term, setTerm] = useState("");

  const [form, setForm] = useState({ idTipoActivo: null, nombre: "" });
  const isEditing = useMemo(() => form.idTipoActivo !== null, [form.idTipoActivo]);

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await apiAssets.get("/TipoActivos");
      setItems(data);
    } catch (e) {
      console.error(e);
      setError("No se pudo cargar Tipos de Activo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const onSearch = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await apiAssets.get("/TipoActivos/search", {
        params: { term: term || "" },
      });
      setItems(data);
    } catch (e) {
      console.error(e);
      setError("No se pudo buscar.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => setForm({ idTipoActivo: null, nombre: "" });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const payload = { nombre: form.nombre };
    try {
      if (!form.nombre.trim()) {
        setError("El nombre es obligatorio.");
        return;
      }

      if (isEditing) {
        await apiAssets.put(`/TipoActivos/${form.idTipoActivo}`, payload);
      } else {
        await apiAssets.post("/TipoActivos", payload);
      }

      resetForm();
      await fetchAll();
    } catch (e2) {
      console.error(e2);
      setError(e2?.response?.data?.message || "No se pudo guardar.");
    }
  };

  const onEdit = (it) => {
    setForm({ idTipoActivo: it.idTipoActivo, nombre: it.nombre });
    setError("");
  };

  const onDelete = async (id) => {
    if (!confirm("¿Eliminar este Tipo de Activo?")) return;
    setError("");
    try {
      await apiAssets.delete(`/TipoActivos/${id}`);
      await fetchAll();
    } catch (e) {
      console.error(e);
      setError("No se pudo eliminar.");
    }
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Tipos de Activo</h2>
          <p className="text-sm text-slate-500">
            CRUD de catálogos. Se usa como combo en el registro de Activos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Buscar..."
              className="pl-10 pr-3 py-2 rounded-xl bg-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-500/40 outline-none text-sm"
            />
          </div>
          <button
            onClick={onSearch}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
          >
            Buscar
          </button>
          <button
            onClick={() => {
              setTerm("");
              fetchAll();
            }}
            className="px-4 py-2 rounded-xl bg-white ring-1 ring-black/5 hover:bg-slate-50 text-sm font-semibold"
          >
            Ver todos
          </button>
        </div>
      </header>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-semibold">{error}</div>
      )}

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Formulario */}
        <form onSubmit={onSubmit} className="lg:col-span-1 bg-slate-50 rounded-2xl p-4 ring-1 ring-black/5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm">
              {isEditing ? "Editar Tipo de Activo" : "Nuevo Tipo de Activo"}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center gap-1 text-slate-600 hover:text-slate-900 text-xs font-semibold"
              title="Limpiar"
            >
              <X size={16} />
              Limpiar
            </button>
          </div>

          <label className="text-xs font-semibold text-slate-600">Nombre</label>
          <input
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="w-full mt-1 px-3 py-2 rounded-xl bg-white ring-1 ring-black/5 focus:ring-2 focus:ring-blue-500/40 outline-none text-sm"
            placeholder="Ej: Equipo de cómputo"
          />

          <button
            type="submit"
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
          >
            {isEditing ? <Save size={18} /> : <Plus size={18} />}
            {isEditing ? "Guardar cambios" : "Crear"}
          </button>
        </form>

        {/* Tabla */}
        <div className="lg:col-span-2 overflow-hidden rounded-2xl ring-1 ring-black/5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-4 py-3 font-bold">ID</th>
                  <th className="text-left px-4 py-3 font-bold">Nombre</th>
                  <th className="text-right px-4 py-3 font-bold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-slate-500">
                      Cargando...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-slate-500">
                      Sin registros
                    </td>
                  </tr>
                ) : (
                  items.map((it) => (
                    <tr key={it.idTipoActivo} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-700">{it.idTipoActivo}</td>
                      <td className="px-4 py-3">{it.nombre}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onEdit(it)}
                            className="px-3 py-1.5 rounded-xl bg-white ring-1 ring-black/5 hover:bg-slate-50 font-semibold"
                          >
                            <span className="inline-flex items-center gap-1">
                              <Pencil size={16} /> Editar
                            </span>
                          </button>
                          <button
                            onClick={() => onDelete(it.idTipoActivo)}
                            className="px-3 py-1.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 font-semibold"
                          >
                            <span className="inline-flex items-center gap-1">
                              <Trash2 size={16} /> Eliminar
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
