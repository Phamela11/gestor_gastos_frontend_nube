import { useEffect, useMemo, useState } from "react";

export type NotaTipo = "gasto" | "ingreso";

export interface NotaFormData {
  titulo: string;
  contenido?: string;
  tipo: NotaTipo;
  id_transaccion?: number | null;
  color?: string;
}

interface TransaccionOption {
  id_transaccion: number;
  fecha_registro: string;
  monto: number | string;
  nombre_categoria?: string;
  tipo?: NotaTipo;
  descripcion?: string | null;
}

interface AddNotaProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NotaFormData) => void;
  mode?: "create" | "edit";
  initialData?: Partial<NotaFormData>;
  transacciones: TransaccionOption[];
}

const formatFecha = (fechaStr?: string) => {
  if (!fechaStr) return "";
  const d = new Date(fechaStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const AddNota = ({
  isOpen,
  onClose,
  onSubmit,
  mode = "create",
  initialData,
  transacciones,
}: AddNotaProps) => {
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [tipo, setTipo] = useState<NotaTipo>("gasto");
  const [idTransaccion, setIdTransaccion] = useState<number | "">("");
  const [colorSeleccionado, setColorSeleccionado] = useState("#10B981");
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setTitulo(initialData?.titulo ?? "");
    setContenido(initialData?.contenido ?? "");
    setTipo(initialData?.tipo ?? "gasto");
    setIdTransaccion(
      initialData?.id_transaccion != null ? initialData.id_transaccion : ""
    );
    setColorSeleccionado(initialData?.color ?? "#10B981");
  }, [
    isOpen,
    initialData?.titulo,
    initialData?.contenido,
    initialData?.tipo,
    initialData?.id_transaccion,
    initialData?.color,
  ]);

  const transaccionesFiltradas = useMemo(() => {
    return transacciones.filter((t) => t.tipo === tipo);
  }, [transacciones, tipo]);

  const selectedTransaccion = useMemo(() => {
    if (idTransaccion === "") return null;
    return (
      transaccionesFiltradas.find((t) => t.id_transaccion === idTransaccion) ?? null
    );
  }, [idTransaccion, transaccionesFiltradas]);

  const transaccionesParaPicker = useMemo(() => {
    const q = pickerSearch.trim().toLowerCase();
    if (!q) return transaccionesFiltradas;

    return transaccionesFiltradas.filter((t) => {
      const text = `${formatFecha(t.fecha_registro)} ${t.nombre_categoria ?? ""} ${String(
        t.monto
      )} ${t.descripcion ?? ""}`.toLowerCase();
      return text.includes(q);
    });
  }, [pickerSearch, transaccionesFiltradas]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo.trim()) {
      alert("El título es requerido");
      return;
    }

    if (titulo.trim().length > 50) {
      alert("El título no puede superar 50 caracteres");
      return;
    }

    if (contenido.trim().length > 200) {
      alert("El contenido no puede superar 200 caracteres");
      return;
    }

    onSubmit({
      titulo: titulo.trim(),
      contenido: contenido.trim() || undefined,
      tipo,
      id_transaccion: idTransaccion === "" ? null : Number(idTransaccion),
      color: colorSeleccionado,
    });
  };

  const handleClose = () => {
    setTitulo("");
    setContenido("");
    setTipo("gasto");
    setIdTransaccion("");
    setColorSeleccionado("#10B981");
    setPickerSearch("");
    setIsPickerOpen(false);
    onClose();
  };

  const handlePickTransaccion = (id: number | null) => {
    setIdTransaccion(id ?? "");
    setPickerSearch("");
    setIsPickerOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md border border-gray-200 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {mode === "edit" ? "Editar Nota" : "Nueva Nota"}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Compra del super"
              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500"
              required
              maxLength={50}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contenido (opcional)
            </label>
            <textarea
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              placeholder="Escribe tu nota..."
              className="w-full min-h-24 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500"
              maxLength={200}
            />
            <div className="mt-1 text-xs text-gray-400">
              {contenido.length}/200
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color de nota
            </label>
            <div className="flex gap-3">
              {[
                { name: "Verde", value: "#10B981" },
                { name: "Azul", value: "#3B82F6" },
                { name: "Morado", value: "#8B5CF6" },
                { name: "Naranja", value: "#F59E0B" },
                { name: "Rojo", value: "#EF4444" },
                { name: "Rosa", value: "#EC4899" },
                { name: "Lima", value: "#84CC16" },
              ].map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setColorSeleccionado(color.value)}
                  className={`w-10 h-10 rounded-full border-2 transition-colors ${
                    colorSeleccionado === color.value
                      ? "border-pink-500 scale-110"
                      : "border-gray-200 hover:border-pink-500"
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de transacción
              </label>
              <select
                value={tipo}
                onChange={(e) => {
                  const next = e.target.value as NotaTipo;
                  setTipo(next);
                  setIdTransaccion("");
                }}
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-pink-500"
              >
                <option value="gasto">Gasto</option>
                <option value="ingreso">Ingreso</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vincular transacción
              </label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 flex items-center justify-between gap-3">
                    <span className="truncate">
                      {idTransaccion === "" ? (
                        "Sin transacción"
                      ) : selectedTransaccion ? (
                        `${formatFecha(selectedTransaccion.fecha_registro)} · ${
                          selectedTransaccion.nombre_categoria ?? "—"
                        } · ${String(selectedTransaccion.monto)}`
                      ) : (
                        "Transacción no encontrada"
                      )}
                    </span>
                    {idTransaccion !== "" && (
                      <button
                        type="button"
                        onClick={() => setIdTransaccion("")}
                        className="text-gray-400 hover:text-gray-600"
                        title="Quitar transacción"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPickerOpen(true)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg text-sm font-medium text-gray-700"
                  >
                    Seleccionar
                  </button>
                </div>
                <div className="text-xs text-gray-400">
                  {transaccionesFiltradas.length} disponibles
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            {mode === "edit" ? "Guardar Cambios" : "Crear Nota"}
          </button>
        </form>
      </div>

      {isPickerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-5 w-full max-w-lg border border-gray-200 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Seleccionar transacción
              </h3>
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <input
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                placeholder="Buscar por fecha, categoría, monto o descripción"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-pink-500"
              />
            </div>

            <div className="max-h-72 overflow-y-auto">
              <button
                type="button"
                onClick={() => handlePickTransaccion(null)}
                className="w-full text-left px-4 py-2 mb-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
              >
                Sin transacción
              </button>

              {transaccionesParaPicker.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-10">
                  No se encontraron transacciones.
                </div>
              ) : (
                transaccionesParaPicker.map((t) => (
                  <button
                    key={t.id_transaccion}
                    type="button"
                    onClick={() => handlePickTransaccion(t.id_transaccion)}
                    className="w-full text-left px-4 py-3 mb-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">
                        {formatFecha(t.fecha_registro)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {String(t.monto)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {t.nombre_categoria ?? "—"}
                      {t.descripcion ? ` · ${t.descripcion}` : ""}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddNota;

