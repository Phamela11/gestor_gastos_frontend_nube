import { useEffect, useState } from "react";

const API_URL = "http://localhost:3000/api/notas";

export interface Nota {
  id_nota: number;
  id_usuario: number;
  id_transaccion: number | null;
  titulo: string;
  contenido: string | null;
  fecha_registro: string;
}

export interface CrearNotaData {
  id_usuario: number;
  titulo: string;
  contenido?: string;
  id_transaccion?: number | null;
}

export interface ActualizarNotaData extends CrearNotaData {}

export const useNota = (idUsuario: number | null) => {
  const [notas, setNotas] = useState<Nota[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const obtenerNotas = async () => {
    if (!idUsuario || idUsuario === 0) {
      setNotas([]);
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
        setNotas(data.notas || []);
      } else {
        throw new Error(data.message || "Error al obtener notas");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al obtener notas";
      setError(errorMessage);
      console.error("Error al obtener notas:", err);
    } finally {
      setCargando(false);
    }
  };

  const crearNota = async (payload: CrearNotaData) => {
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
      await obtenerNotas();
      return data.nota as Nota;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al crear nota";
      setError(errorMessage);
      throw err;
    } finally {
      setCargando(false);
    }
  };

  const actualizarNota = async (
    idNota: number,
    payload: ActualizarNotaData
  ) => {
    try {
      setCargando(true);
      setError(null);
      const response = await fetch(`${API_URL}/${idNota}`, {
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
      await obtenerNotas();
      return data.nota as Nota;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al actualizar nota";
      setError(errorMessage);
      throw err;
    } finally {
      setCargando(false);
    }
  };

  const eliminarNota = async (idNota: number) => {
    if (!idUsuario || idUsuario === 0) {
      const err = new Error("No se ha iniciado sesión (idUsuario inválido)");
      setError(err.message);
      throw err;
    }

    try {
      setCargando(true);
      setError(null);
      const response = await fetch(`${API_URL}/${idNota}`, {
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

      await obtenerNotas();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al eliminar nota";
      setError(errorMessage);
      throw err;
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (idUsuario && idUsuario > 0) {
      obtenerNotas();
    } else {
      setNotas([]);
      setCargando(false);
    }
  }, [idUsuario]);

  return {
    notas,
    cargando,
    error,
    obtenerNotas,
    crearNota,
    actualizarNota,
    eliminarNota,
  };
};

