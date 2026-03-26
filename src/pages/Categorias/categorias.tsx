import { useState, useEffect } from "react";
import MainLayout from "../../components/Layout/mainLayout";
import AddCategoria, { CategoriaFormData } from "../../components/Modal/addCategoria";
import { useCategoria, Categoria } from "./useCategoria";

const Categorias = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [idUsuario, setIdUsuario] = useState<number | null>(null);
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(
    null
  );
  const [categoriaColors, setCategoriaColors] = useState<Record<number, string>>(
    {}
  );

  // Obtener id_usuario del localStorage (guardado en el login)
  useEffect(() => {
    const usuarioStr = localStorage.getItem("usuario");
    if (usuarioStr) {
      const usuario = JSON.parse(usuarioStr);
      setIdUsuario(usuario.id_usuario);
    }
  }, []);

  // Cargar colores guardados por usuario (persistencia en localStorage)
  useEffect(() => {
    if (!idUsuario) {
      setCategoriaColors({});
      return;
    }

    const key = `categoria_colors_${idUsuario}`;
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : {};
      setCategoriaColors(parsed && typeof parsed === "object" ? parsed : {});
    } catch {
      setCategoriaColors({});
    }
  }, [idUsuario]);

  const persistColors = (next: Record<number, string>) => {
    if (!idUsuario) return;
    const key = `categoria_colors_${idUsuario}`;
    localStorage.setItem(key, JSON.stringify(next));
  };

  const setColorForCategoria = (idCategoria: number, color?: string) => {
    if (!color) return;
    setCategoriaColors((prev) => {
      const next = { ...prev, [idCategoria]: color };
      persistColors(next);
      return next;
    });
  };

  const removeColorForCategoria = (idCategoria: number) => {
    setCategoriaColors((prev) => {
      if (!(idCategoria in prev)) return prev;
      const next = { ...prev };
      delete next[idCategoria];
      persistColors(next);
      return next;
    });
  };

  // Solo cargar categorías si hay idUsuario
  const {
    categorias,
    cargando,
    error,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria,
  } = useCategoria(idUsuario);

  // Colores predefinidos para las categorías
  const colores = [
    "#10B981", // Verde
    "#3B82F6", // Azul
    "#8B5CF6", // Morado
    "#F59E0B", // Naranja
    "#EF4444", // Rojo
    "#06B6D4", // Cyan
    "#EC4899", // Rosa
  ];

  // Función para obtener color basado en el índice
  const obtenerColor = (index: number) => {
    return colores[index % colores.length];
  };

  const getColorCategoria = (categoria: Categoria, index: number) => {
    return categoriaColors[categoria.id_categoria] || obtenerColor(index);
  };

  // Separar categorías por tipo
  const categoriasGastos = categorias.filter((cat) => cat.tipo === "gasto");
  const categoriasIngresos = categorias.filter((cat) => cat.tipo === "ingreso");

  const handleEditarCategoria = (categoria: Categoria) => {
    setCategoriaEditando(categoria);
    setIsModalOpen(true);
  };

  const handleGuardarCategoria = async (categoriaData: CategoriaFormData) => {
    if (!idUsuario) {
      alert("No se ha iniciado sesión. Por favor, recarga la página después de iniciar sesión.");
      return;
    }

    const nombreNormalized = categoriaData.nombre_categoria.trim().toLowerCase();
    const existe = categorias.some((c) => {
      const mismoNombre = c.nombre_categoria.trim().toLowerCase() === nombreNormalized;
      const esMismaCategoria = categoriaEditando
        ? c.id_categoria === categoriaEditando.id_categoria
        : false;
      return mismoNombre && !esMismaCategoria;
    });

    if (existe) {
      alert("Ya existe una categoría con este nombre. Por favor usa otro nombre.");
      return;
    }

    try {
      if (categoriaEditando) {
        await actualizarCategoria(categoriaEditando.id_categoria, {
          id_usuario: idUsuario,
          nombre_categoria: categoriaData.nombre_categoria,
          tipo: categoriaData.tipo,
          descripcion: categoriaData.descripcion,
        });
        setColorForCategoria(categoriaEditando.id_categoria, categoriaData.color);
      } else {
        const creada = await crearCategoria({
        id_usuario: idUsuario,
        nombre_categoria: categoriaData.nombre_categoria,
        tipo: categoriaData.tipo,
        descripcion: categoriaData.descripcion,
      });
        if (creada?.id_categoria) {
          setColorForCategoria(creada.id_categoria, categoriaData.color);
        }
      }
      setIsModalOpen(false);
      setCategoriaEditando(null);
    } catch (error: any) {
      alert(
        error.message ||
          (categoriaEditando ? "Error al actualizar categoría" : "Error al crear categoría")
      );
    }
  };

  const handleEliminarCategoria = async (categoria: Categoria) => {
    if (!idUsuario) {
      alert("No se ha iniciado sesión. Por favor, recarga la página después de iniciar sesión.");
      return;
    }

    const ok = confirm(
      `¿Eliminar la categoría "${categoria.nombre_categoria}"? Esta acción no se puede deshacer.`
    );
    if (!ok) return;

    try {
      await eliminarCategoria(categoria.id_categoria);
      removeColorForCategoria(categoria.id_categoria);
    } catch (error: any) {
      alert(error.message || "Error al eliminar categoría");
    }
  };

  return (
    <MainLayout title="Categorías">
      <div className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={() => {
              setCategoriaEditando(null);
              setIsModalOpen(true);
            }}
            className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <span>+</span>
            Nueva Categoría
          </button>
        </div>

        {cargando ? (
          <div className="text-center text-gray-500">Cargando categorías...</div>
        ) : (
          <>
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Categorías de Gastos</h2>
              {categoriasGastos.length === 0 ? (
                <p className="text-gray-500">No hay categorías de gastos</p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {categoriasGastos.map((categoria, index) => (
                    <div
                      key={categoria.id_categoria}
                      className="bg-white rounded-lg p-4 flex items-center gap-3 border border-gray-200 hover:border-pink-500 transition-colors shadow-sm"
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: getColorCategoria(categoria, index) }}
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-gray-900 font-medium block truncate">
                        {categoria.nombre_categoria}
                      </span>
                        {categoria.descripcion && (
                          <span className="text-xs text-gray-500 block truncate">
                            {categoria.descripcion}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditarCategoria(categoria)}
                          className="text-xs px-2 py-1 rounded border border-gray-200 hover:border-pink-500 hover:text-pink-600 transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          aria-label="Eliminar categoría"
                          onClick={() => handleEliminarCategoria(categoria)}
                          className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 hover:border-red-400 hover:text-red-600 transition-colors"
                          title="Eliminar"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Categorías de Ingresos</h2>
              {categoriasIngresos.length === 0 ? (
                <p className="text-gray-500">No hay categorías de ingresos</p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {categoriasIngresos.map((categoria, index) => (
                    <div
                      key={categoria.id_categoria}
                      className="bg-white rounded-lg p-4 flex items-center gap-3 border border-gray-200 hover:border-pink-500 transition-colors shadow-sm"
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: getColorCategoria(categoria, index) }}
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-gray-900 font-medium block truncate">
                        {categoria.nombre_categoria}
                      </span>
                        {categoria.descripcion && (
                          <span className="text-xs text-gray-500 block truncate">
                            {categoria.descripcion}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditarCategoria(categoria)}
                          className="text-xs px-2 py-1 rounded border border-gray-200 hover:border-pink-500 hover:text-pink-600 transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          aria-label="Eliminar categoría"
                          onClick={() => handleEliminarCategoria(categoria)}
                          className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 hover:border-red-400 hover:text-red-600 transition-colors"
                          title="Eliminar"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <AddCategoria
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCategoriaEditando(null);
        }}
        onSubmit={handleGuardarCategoria}
        mode={categoriaEditando ? "edit" : "create"}
        initialData={
          categoriaEditando
            ? {
                nombre_categoria: categoriaEditando.nombre_categoria,
                tipo: categoriaEditando.tipo,
                descripcion: categoriaEditando.descripcion,
                color: categoriaColors[categoriaEditando.id_categoria],
              }
            : undefined
        }
      />
    </MainLayout>
  );
};

export default Categorias;

