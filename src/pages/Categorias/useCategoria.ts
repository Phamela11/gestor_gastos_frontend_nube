import { useState, useEffect } from "react";
import { API } from "../../config/apiConfig";

const API_URL = `${API}/api/categorias`;

export interface Categoria {
  id_categoria: number;
  id_usuario: number;
  nombre_categoria: string;
  tipo: "gasto" | "ingreso";
  descripcion?: string;
}

export interface CrearCategoriaData {
  id_usuario: number;
  nombre_categoria: string;
  tipo: "gasto" | "ingreso";
  descripcion?: string;
}

export const useCategoria = (idUsuario: number | null) => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener todas las categorías
  const obtenerCategorias = async () => {
    if (!idUsuario || idUsuario === 0) {
      setCategorias([]);
      return; // No hacer petición si no hay idUsuario
    }

    try {
      setCargando(true);
      setError(null);
      const response = await fetch(`${API_URL}/${idUsuario}`);
      
      // Verificar si la respuesta es JSON antes de intentar parsearla
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Error ${response.status}: El servidor respondió con ${contentType || 'tipo desconocido'}. Verifica que el servidor esté corriendo y que la ruta sea correcta.`);
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `Error ${response.status}: ${response.statusText}`,
        }));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        setCategorias(data.categorias || []);
      } else {
        throw new Error(data.message || "Error al obtener categorías");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al obtener categorías";
      setError(errorMessage);
      console.error("Error al obtener categorías:", err);
    } finally {
      setCargando(false);
    }
  };

  // Crear categoría
  const crearCategoria = async (categoriaData: CrearCategoriaData) => {
    try {
      setCargando(true);
      setError(null);
      const response = await fetch(`${API_URL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoriaData),
      });

      // Verificar si la respuesta es JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Error ${response.status}: El servidor respondió con ${contentType || 'tipo desconocido'}. Verifica que el servidor esté corriendo.`);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `Error ${response.status}: ${response.statusText}`,
        }));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      await obtenerCategorias(); // Recargar categorías
      return data.categoria;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al crear categoría";
      setError(errorMessage);
      throw err;
    } finally {
      setCargando(false);
    }
  };

  // Actualizar categoría
  const actualizarCategoria = async (
    idCategoria: number,
    categoriaData: CrearCategoriaData
  ) => {
    try {
      setCargando(true);
      setError(null);
      const response = await fetch(`${API_URL}/${idCategoria}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoriaData),
      });

      // Verificar si la respuesta es JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Error ${response.status}: El servidor respondió con ${contentType || 'tipo desconocido'}. Verifica que el servidor esté corriendo.`);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `Error ${response.status}: ${response.statusText}`,
        }));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      await obtenerCategorias(); // Recargar categorías
      return data.categoria;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al actualizar categoría";
      setError(errorMessage);
      throw err;
    } finally {
      setCargando(false);
    }
  };

  // Eliminar categoría
  const eliminarCategoria = async (idCategoria: number) => {
    if (!idUsuario || idUsuario === 0) {
      const err = new Error("No se ha iniciado sesión (idUsuario inválido)");
      setError(err.message);
      throw err;
    }
    try {
      setCargando(true);
      setError(null);
      const response = await fetch(`${API_URL}/${idCategoria}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_usuario: idUsuario }),
      });

      // Verificar si la respuesta es JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Error ${response.status}: El servidor respondió con ${contentType || 'tipo desconocido'}. Verifica que el servidor esté corriendo.`);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `Error ${response.status}: ${response.statusText}`,
        }));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      await obtenerCategorias(); // Recargar categorías
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al eliminar categoría";
      setError(errorMessage);
      throw err;
    } finally {
      setCargando(false);
    }
  };

  // Cargar categorías al montar el componente
  useEffect(() => {
    if (idUsuario && idUsuario > 0) {
      obtenerCategorias();
    } else {
      setCategorias([]);
      setCargando(false);
    }
  }, [idUsuario]);

  return {
    categorias,
    cargando,
    error,
    obtenerCategorias,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria,
  };
};

