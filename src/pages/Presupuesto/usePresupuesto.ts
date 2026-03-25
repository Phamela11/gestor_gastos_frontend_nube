import { useState, useEffect } from "react";

const API_URL = "http://localhost:3000/api/presupuestos";

export interface Presupuesto {
  id_presupuesto: number;
  id_usuario: number;
  id_categoria: number;
  monto_limite: number | string;
  fecha_inicio: string;
  fecha_fin: string;
  nombre_categoria?: string;
  tipo_categoria?: "gasto" | "ingreso";
  /** Suma de gastos en esa categoría en el rango [fecha_inicio, fecha_fin] */
  gastado?: number;
}

export interface CrearPresupuestoData {
  id_usuario: number;
  id_categoria: number;
  monto_limite: number;
  fecha_inicio: string;
  fecha_fin: string;
}

export interface ActualizarPresupuestoData extends CrearPresupuestoData {}

export const usePresupuesto = (idUsuario: number | null) => {
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const obtenerPresupuestos = async () => {
    if (!idUsuario || idUsuario === 0) {
      setPresupuestos([]);
      return;
    }

    try {
      setCargando(true);
      setError(null);
      const response = await fetch(`${API_URL}/${idUsuario}`);

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          `Error ${response.status}: El servidor respondió con ${
            contentType || "tipo desconocido"
          }. Verifica que el servidor esté corriendo y que la ruta sea correcta.`
        );
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `Error ${response.status}: ${response.statusText}`,
        }));
        throw new Error(
          errorData.message || `Error ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      if (data.success) {
        setPresupuestos(data.presupuestos || []);
      } else {
        throw new Error(data.message || "Error al obtener presupuestos");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al obtener presupuestos";
      setError(errorMessage);
      console.error("Error al obtener presupuestos:", err);
    } finally {
      setCargando(false);
    }
  };

  const crearPresupuesto = async (payload: CrearPresupuestoData) => {
    try {
      setCargando(true);
      setError(null);
      const response = await fetch(`${API_URL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          `Error ${response.status}: El servidor respondió con ${
            contentType || "tipo desconocido"
          }. Verifica que el servidor esté corriendo.`
        );
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `Error ${response.status}: ${response.statusText}`,
        }));
        throw new Error(
          errorData.message || `Error ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      await obtenerPresupuestos();
      return data.presupuesto as Presupuesto;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al crear presupuesto";
      setError(errorMessage);
      throw err;
    } finally {
      setCargando(false);
    }
  };

  const actualizarPresupuesto = async (
    idPresupuesto: number,
    payload: ActualizarPresupuestoData
  ) => {
    try {
      setCargando(true);
      setError(null);
      const response = await fetch(`${API_URL}/${idPresupuesto}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          `Error ${response.status}: El servidor respondió con ${
            contentType || "tipo desconocido"
          }. Verifica que el servidor esté corriendo.`
        );
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `Error ${response.status}: ${response.statusText}`,
        }));
        throw new Error(
          errorData.message || `Error ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      await obtenerPresupuestos();
      return data.presupuesto as Presupuesto;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al actualizar presupuesto";
      setError(errorMessage);
      throw err;
    } finally {
      setCargando(false);
    }
  };

  const eliminarPresupuesto = async (idPresupuesto: number) => {
    if (!idUsuario || idUsuario === 0) {
      const err = new Error("No se ha iniciado sesión (idUsuario inválido)");
      setError(err.message);
      throw err;
    }

    try {
      setCargando(true);
      setError(null);
      const response = await fetch(`${API_URL}/${idPresupuesto}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_usuario: idUsuario }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          `Error ${response.status}: El servidor respondió con ${
            contentType || "tipo desconocido"
          }. Verifica que el servidor esté corriendo.`
        );
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `Error ${response.status}: ${response.statusText}`,
        }));
        throw new Error(
          errorData.message || `Error ${response.status}: ${response.statusText}`
        );
      }

      await obtenerPresupuestos();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al eliminar presupuesto";
      setError(errorMessage);
      throw err;
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (idUsuario && idUsuario > 0) {
      obtenerPresupuestos();
    } else {
      setPresupuestos([]);
      setCargando(false);
    }
  }, [idUsuario]);

  return {
    presupuestos,
    cargando,
    error,
    obtenerPresupuestos,
    crearPresupuesto,
    actualizarPresupuesto,
    eliminarPresupuesto,
  };
};
