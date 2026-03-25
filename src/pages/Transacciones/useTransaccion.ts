import { useEffect, useState } from "react";

const API_URL = "http://localhost:3000/api/transacciones";

export interface Transaccion {
  id_transaccion: number;
  id_usuario: number;
  id_categoria: number;
  monto: number | string;
  descripcion?: string | null;
  fecha_registro: string;
  // campos opcionales si el backend hace JOIN con categoria
  nombre_categoria?: string;
  tipo?: "gasto" | "ingreso";
}

export interface CrearTransaccionData {
  id_usuario: number;
  id_categoria: number;
  monto: number;
  descripcion?: string;
}

export const useTransaccion = (idUsuario: number | null) => {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const obtenerTransacciones = async () => {
    if (!idUsuario || idUsuario === 0) {
      setTransacciones([]);
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
        setTransacciones(data.transacciones || []);
      } else {
        throw new Error(data.message || "Error al obtener transacciones");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Error al obtener transacciones";
      setError(errorMessage);
      console.error("Error al obtener transacciones:", err);
    } finally {
      setCargando(false);
    }
  };

  const crearTransaccion = async (transaccionData: CrearTransaccionData) => {
    try {
      setCargando(true);
      setError(null);
      const response = await fetch(`${API_URL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transaccionData),
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
      await obtenerTransacciones();
      
      return {
        transaccion: data.transaccion as Transaccion,
        presupuestoSuperado: data.presupuesto_superado || false,
        mensajePresupuesto: data.mensaje_presupuesto || null,
        idTransaccion: data.transaccion?.id_transaccion || null,
      };
    } catch (err: any) {
      const errorMessage = err.message || "Error al crear transacción";
      setError(errorMessage);
      throw err;
    } finally {
      setCargando(false);
    }
  };

  const eliminarTransaccion = async (idTransaccion: number) => {
    if (!idUsuario || idUsuario === 0) {
      const err = new Error("No se ha iniciado sesión (idUsuario inválido)");
      setError(err.message);
      throw err;
    }

    try {
      setCargando(true);
      setError(null);
      const response = await fetch(`${API_URL}/${idTransaccion}`, {
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

      await obtenerTransacciones();
    } catch (err: any) {
      const errorMessage = err.message || "Error al eliminar transacción";
      setError(errorMessage);
      throw err;
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (idUsuario && idUsuario > 0) {
      obtenerTransacciones();
    } else {
      setTransacciones([]);
      setCargando(false);
    }
  }, [idUsuario]);

  return {
    transacciones,
    cargando,
    error,
    obtenerTransacciones,
    crearTransaccion,
    eliminarTransaccion,
  };
};

