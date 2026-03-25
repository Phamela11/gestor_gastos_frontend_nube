import { useEffect, useState } from "react";

export interface PresupuestoFormData {
  id_categoria: number;
  monto_limite: number;
  fecha_inicio: string;
  fecha_fin: string;
}

interface CategoriaOption {
  id_categoria: number;
  nombre_categoria: string;
}

interface AddPresupuestoProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PresupuestoFormData) => void;
  categoriasGasto: CategoriaOption[];
  mode?: "create" | "edit";
  initialData?: Partial<PresupuestoFormData>;
}

const formatDateForInput = (dateStr: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

const AddPresupuesto = ({
  isOpen,
  onClose,
  onSubmit,
  categoriasGasto,
  mode = "create",
  initialData,
}: AddPresupuestoProps) => {
  const [id_categoria, setIdCategoria] = useState<number>(0);
  const [monto_limite, setMontoLimite] = useState<string>("");
  const [fecha_inicio, setFechaInicio] = useState("");
  const [fecha_fin, setFechaFin] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setIdCategoria(initialData?.id_categoria ?? (categoriasGasto[0]?.id_categoria ?? 0));
    setMontoLimite(
      initialData?.monto_limite != null ? String(initialData.monto_limite) : ""
    );
    setFechaInicio(
      initialData?.fecha_inicio ? formatDateForInput(initialData.fecha_inicio) : ""
    );
    setFechaFin(
      initialData?.fecha_fin ? formatDateForInput(initialData.fecha_fin) : ""
    );
  }, [
    isOpen,
    initialData?.id_categoria,
    initialData?.monto_limite,
    initialData?.fecha_inicio,
    initialData?.fecha_fin,
    categoriasGasto,
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const idCat = id_categoria || categoriasGasto[0]?.id_categoria;
    if (!idCat) {
      alert("Debe existir al menos una categoría de tipo gasto.");
      return;
    }

    const monto = Number(monto_limite);
    if (Number.isNaN(monto) || monto < 0) {
      alert("El monto límite debe ser un número positivo.");
      return;
    }

    if (!fecha_inicio || !fecha_fin) {
      alert("Las fechas de inicio y fin son requeridas.");
      return;
    }

    if (new Date(fecha_fin) < new Date(fecha_inicio)) {
      alert("La fecha fin no puede ser anterior a la fecha inicio.");
      return;
    }

    onSubmit({
      id_categoria: idCat,
      monto_limite: monto,
      fecha_inicio,
      fecha_fin,
    });

    setMontoLimite("");
    setFechaInicio("");
    setFechaFin("");
  };

  const handleClose = () => {
    setMontoLimite("");
    setFechaInicio("");
    setFechaFin("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md border border-gray-200 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {mode === "edit" ? "Editar presupuesto" : "Nuevo presupuesto"}
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
              Categoría (gasto)
            </label>
            <select
              value={id_categoria ? String(id_categoria) : ""}
              onChange={(e) => setIdCategoria(Number(e.target.value))}
              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-pink-500"
              required
            >
              <option value="">Seleccione una categoría</option>
              {categoriasGasto.map((c) => (
                <option key={c.id_categoria} value={c.id_categoria}>
                  {c.nombre_categoria}
                </option>
              ))}
            </select>
            {categoriasGasto.length === 0 && (
              <p className="text-sm text-amber-600 mt-1">
                Crea primero una categoría de tipo &quot;gasto&quot;.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto límite (COP)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={monto_limite}
              onChange={(e) => setMontoLimite(e.target.value)}
              placeholder="Ej: 400000"
              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha inicio
            </label>
            <input
              type="date"
              value={fecha_inicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-pink-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha fin
            </label>
            <input
              type="date"
              value={fecha_fin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-pink-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
            disabled={categoriasGasto.length === 0}
          >
            {mode === "edit" ? "Guardar cambios" : "Crear presupuesto"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddPresupuesto;
