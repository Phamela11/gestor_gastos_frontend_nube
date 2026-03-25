import { useEffect, useState } from "react";
import type { Categoria } from "../../pages/Categorias/useCategoria";

export interface TransaccionFormData {
  id_categoria: number;
  monto: number;
  descripcion?: string;
}

interface AddTransaccionProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TransaccionFormData) => void;
  categorias: Categoria[];
}

const AddTransaccion = ({
  isOpen,
  onClose,
  onSubmit,
  categorias,
}: AddTransaccionProps) => {
  const [categoriaId, setCategoriaId] = useState<number | "">("");
  const [monto, setMonto] = useState<string>("");
  const [descripcion, setDescripcion] = useState<string>("");

  useEffect(() => {
    if (!isOpen) return;

    if (categorias.length > 0) {
      setCategoriaId(categorias[0].id_categoria);
    } else {
      setCategoriaId("");
    }
    setMonto("");
    setDescripcion("");
  }, [isOpen, categorias]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoriaId) {
      alert("Selecciona una categoría");
      return;
    }

    const montoNumber = Number(monto.replace(",", "."));
    if (!monto || Number.isNaN(montoNumber) || montoNumber <= 0) {
      alert("Ingresa un monto válido mayor que 0");
      return;
    }

    onSubmit({
      id_categoria: Number(categoriaId),
      monto: montoNumber,
      descripcion: descripcion.trim() || undefined,
    });
  };

  const handleClose = () => {
    setMonto("");
    setDescripcion("");
    onClose();
  };

  if (!isOpen) return null;

  const categoriasGasto = categorias.filter((c) => c.tipo === "gasto");
  const categoriasIngreso = categorias.filter((c) => c.tipo === "ingreso");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md border border-gray-200 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Nueva Transacción</h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        {categorias.length === 0 ? (
          <p className="text-sm text-gray-600">
            Primero debes crear al menos una categoría para poder registrar
            transacciones.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                value={categoriaId}
                onChange={(e) =>
                  setCategoriaId(
                    e.target.value ? Number(e.target.value) : ""
                  )
                }
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-pink-500"
              >
                <option value="">Selecciona una categoría</option>
                {categoriasGasto.length > 0 && (
                  <optgroup label="Gastos">
                    {categoriasGasto.map((c) => (
                      <option key={c.id_categoria} value={c.id_categoria}>
                        {c.nombre_categoria}
                      </option>
                    ))}
                  </optgroup>
                )}
                {categoriasIngreso.length > 0 && (
                  <optgroup label="Ingresos">
                    {categoriasIngreso.map((c) => (
                      <option key={c.id_categoria} value={c.id_categoria}>
                        {c.nombre_categoria}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monto
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="Ej: 150.00"
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción (opcional)
              </label>
              <input
                type="text"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Ej: Restaurante, pago alquiler, salario..."
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 rounded-lg transition-colors"
            >
              Guardar Transacción
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddTransaccion;

