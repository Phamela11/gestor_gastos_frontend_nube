import { useEffect, useState } from "react";

export interface CategoriaFormData {
  nombre_categoria: string;
  tipo: "gasto" | "ingreso";
  descripcion?: string;
  color?: string;
}

interface AddCategoriaProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoriaFormData) => void;
  mode?: "create" | "edit";
  initialData?: Partial<CategoriaFormData>;
}

const AddCategoria = ({
  isOpen,
  onClose,
  onSubmit,
  mode = "create",
  initialData,
}: AddCategoriaProps) => {
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState<"gasto" | "ingreso">("gasto");
  const [descripcion, setDescripcion] = useState("");
  const [colorSeleccionado, setColorSeleccionado] = useState("#10B981");

  useEffect(() => {
    if (!isOpen) return;
    setNombre(initialData?.nombre_categoria ?? "");
    setTipo(initialData?.tipo ?? "gasto");
    setDescripcion(initialData?.descripcion ?? "");
    setColorSeleccionado(initialData?.color ?? "#10B981");
  }, [
    isOpen,
    initialData?.nombre_categoria,
    initialData?.tipo,
    initialData?.descripcion,
    initialData?.color,
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nombre.trim()) {
      alert("El nombre es requerido");
      return;
    }

    onSubmit({
        nombre_categoria: nombre.trim(),
        tipo,
        descripcion: descripcion.trim() || undefined,
        color: colorSeleccionado,
      });

    // Limpiar formulario
    setNombre("");
    setTipo("gasto");
    setDescripcion("");
    setColorSeleccionado("#10B981");
  };

  const handleClose = () => {
    setNombre("");
    setTipo("gasto");
    setDescripcion("");
    setColorSeleccionado("#10B981");
    onClose();
  };

  if (!isOpen) return null;

  const colores = [
    { nombre: "Verde", valor: "#10B981" },
    { nombre: "Azul", valor: "#3B82F6" },
    { nombre: "Morado", valor: "#8B5CF6" },
    { nombre: "Naranja", valor: "#F59E0B" },
    { nombre: "Rojo", valor: "#EF4444" },
    { nombre: "Rosa", valor: "#EC4899" },
    { nombre: "Lima", valor: "#84CC16" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md border border-gray-200 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {mode === "edit" ? "Editar Categoría" : "Nueva Categoría"}
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
              Nombre
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Suscripciones"
              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as "gasto" | "ingreso")}
              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-pink-500"
            >
              <option value="gasto">Gasto</option>
              <option value="ingreso">Ingreso</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción (opcional)
            </label>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: Suscripciones mensuales"
              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="flex gap-3">
              {colores.map((color) => (
                <button
                  key={color.valor}
                  type="button"
                  onClick={() => setColorSeleccionado(color.valor)}
                  className={`w-10 h-10 rounded-full border-2 transition-colors ${
                    colorSeleccionado === color.valor
                      ? "border-pink-500 scale-110"
                      : "border-gray-200 hover:border-pink-500"
                  }`}
                  style={{ backgroundColor: color.valor }}
                  title={color.nombre}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            {mode === "edit" ? "Guardar Cambios" : "Crear Categoría"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCategoria;

