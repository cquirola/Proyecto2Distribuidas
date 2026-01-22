import { useEffect, useMemo, useState } from "react";
import { apiAssets } from "../../../core/api/axios";
import { Search, Plus, Save, X, Trash2, Pencil } from "lucide-react";

const money = (n) => {
  const v = Number(n ?? 0);
  return v.toLocaleString("es-EC", { style: "currency", currency: "USD" });
};

export default function ActivosPage() {
  const [items, setItems] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [term, setTerm] = useState("");

  const [form, setForm] = useState({
    idActivo: null,
    nombre: "",
    periodosDepreciacionTotal: 12,
    valorCompra: 0,
    idTipoActivo: "",
  });

  const isEditing = useMemo(() => form.idActivo !== null, [form.idActivo]);

  const fetchTipos = async () => {
    const { data } = await apiAssets.get("/TipoActivos");
    setTipos(data);
  };

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await apiAssets.get("/Activos");
      setItems(data);
    } catch (e) {
      console.error(e);
      setError("No se pudo cargar Activos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await Promise.all([fetchTipos(), fetchAll()]);
      } catch (e) {
        console.error(e);
        setError("No se pudo inicializar el módulo de Activos.");
      }
    })();
  }, []);

  const onSearch = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await apiAssets.get("/Activos/search", {
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

  const resetForm = () =>
    setForm({
      idActivo: null,
      nombre: "",
      periodosDepreciacionTotal: 12,
      valorCompra: 0,
      idTipoActivo: tipos?.[0]?.idTipoActivo ?? "",
    });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const nombre = form.nombre?.trim();
    const periodos = Number(form.periodosDepreciacionTotal);
    const valor = Number(form.valorCompra);
    const idTipoActivo = Number(form.idTipoActivo);

    if (!nombre) return setError("El nombre es obligatorio.");
    if (!Number.isFinite(periodos) || periodos <= 0)
      return setError("Los periodos deben ser mayores a 0.");
    if (!Number.isFinite(valor) || valor <= 0)
      return setError("El valor de compra debe ser mayor a 0.");
    if (!Number.isFinite(idTipoActivo) || idTipoActivo <= 0)
      return setError("Seleccione un Tipo de Activo.");

    const payload = {
      nombre,
      periodosDepreciacionTotal: periodos,
      valorCompra: valor,
      idTipoActivo,
    };

    try {
      if (isEditing) {
        await apiAssets.put(`/Activos/${form.idActivo}`, payload);
      } else {
        await apiAssets.post("/Activos", payload);
      }
      resetForm();
      await fetchAll();
    } catch (e2) {
      console.error(e2);
      setError(e2?.response?.data?.message || "No se pudo guardar.");
    }
  };

  const onEdit = (it) => {
    setForm({
      idActivo: it.idActivo,
      nombre: it.nombre,
      periodosDepreciacionTotal: it.periodosDepreciacionTotal,
      valorCompra: it.valorCompra,
      idTipoActivo: it.idTipoActivo,
    });
    setError("");
  };

  const onDelete = async (id) => {
    if (!confirm("¿Eliminar este Activo?")) return;
    setError("");
    try {
      await apiAssets.delete(`/Activos/${id}`);
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
          <h2 className="text-lg font-bold">Activos</h2>
          <p className="text-sm text-slate-500">
            Registro de activos con tipo, valor de compra y periodos de depreciación.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Buscar por activo o tipo..."
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
            <h3 className="font-bold text-sm">{isEditing ? "Editar Activo" : "Nuevo Activo"}</h3>
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
            placeholder='Ej: Laptop Dell 14"'
          />

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="text-xs font-semibold text-slate-600">Periodos</label>
              <input
                type="number"
                value={form.periodosDepreciacionTotal}
                onChange={(e) => setForm({ ...form, periodosDepreciacionTotal: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-white ring-1 ring-black/5 focus:ring-2 focus:ring-blue-500/40 outline-none text-sm"
                min={1}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Valor compra</label>
              <input
                type="number"
                value={form.valorCompra}
                onChange={(e) => setForm({ ...form, valorCompra: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-white ring-1 ring-black/5 focus:ring-2 focus:ring-blue-500/40 outline-none text-sm"
                min={0}
                step={0.01}
              />
            </div>
          </div>

          <label className="text-xs font-semibold text-slate-600 mt-3 block">Tipo de activo</label>
          <select
            value={form.idTipoActivo}
            onChange={(e) => setForm({ ...form, idTipoActivo: e.target.value })}
            className="w-full mt-1 px-3 py-2 rounded-xl bg-white ring-1 ring-black/5 focus:ring-2 focus:ring-blue-500/40 outline-none text-sm"
          >
            <option value="">Seleccione...</option>
            {tipos.map((t) => (
              <option key={t.idTipoActivo} value={t.idTipoActivo}>
                {t.nombre}
              </option>
            ))}
          </select>

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
                  <th className="text-left px-4 py-3 font-bold">Activo</th>
                  <th className="text-left px-4 py-3 font-bold">Tipo</th>
                  <th className="text-right px-4 py-3 font-bold">Valor</th>
                  <th className="text-right px-4 py-3 font-bold">Periodos</th>
                  <th className="text-right px-4 py-3 font-bold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                      Cargando...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                      Sin registros
                    </td>
                  </tr>
                ) : (
                  items.map((it) => (
                    <tr key={it.idActivo} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-700">{it.idActivo}</td>
                      <td className="px-4 py-3">{it.nombre}</td>
                      <td className="px-4 py-3">{it.tipoActivoNombre ?? "-"}</td>
                      <td className="px-4 py-3 text-right font-semibold">{money(it.valorCompra)}</td>
                      <td className="px-4 py-3 text-right">{it.periodosDepreciacionTotal}</td>
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
                            onClick={() => onDelete(it.idActivo)}
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
