import { useEffect, useMemo, useState } from "react";
import MainLayout from "../../components/Layout/mainLayout";
import AddNota, { NotaFormData } from "../../components/Modal/addNota";
import { useNota, Nota } from "./useNota";
import { useTransaccion } from "../Transacciones/useTransaccion";

const NOTE_COLORS_KEY = "nota-colors";

const loadNoteColors = (): Record<number, string> => {
  try {
    const raw = localStorage.getItem(NOTE_COLORS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<number, string>;
  } catch {
    return {};
  }
};

const saveNoteColor = (id: number, color: string) => {
  try {
    const current = loadNoteColors();
    const updated = { ...current, [id]: color };
    localStorage.setItem(NOTE_COLORS_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
};

const removeNoteColor = (id: number) => {
  try {
    const current = loadNoteColors();
    if (!(id in current)) return;
    const { [id]: _, ...rest } = current;
    localStorage.setItem(NOTE_COLORS_KEY, JSON.stringify(rest));
  } catch {
    // ignore
  }
};

const coloresBase = [
  "#10B981",
  "#3B82F6",
  "#8B5CF6",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
  "#EC4899",
];

const obtenerColor = (index: number) =>
  coloresBase[index % coloresBase.length];

const formatFecha = (fechaStr: string) => {
  if (!fechaStr) return "";
  const d = new Date(fechaStr);
  if (Number.isNaN(d.getTime())) return fechaStr;
  return d.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const Notas = () => {
  const [idUsuario, setIdUsuario] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [notaEditando, setNotaEditando] = useState<Nota | null>(null);
  const [notaColors, setNotaColors] = useState<Record<number, string>>(() => loadNoteColors());

  useEffect(() => {
    const usuarioStr = localStorage.getItem("usuario");
    if (usuarioStr) {
      try {
        const usuario = JSON.parse(usuarioStr);
        setIdUsuario(usuario.id_usuario ?? null);
      } catch {
        setIdUsuario(null);
      }
    } else {
      setIdUsuario(null);
    }
  }, []);

  const { notas, cargando, error, crearNota, actualizarNota, eliminarNota } =
    useNota(idUsuario);
  const { transacciones } = useTransaccion(idUsuario);

  const handleAbrirModal = () => {
    setNotaEditando(null);
    setIsModalOpen(true);
  };

  const handleEditarNota = (nota: Nota) => {
    setNotaEditando(nota);
    setIsModalOpen(true);
  };

  const handleCerrarModal = () => {
    setIsModalOpen(false);
    setNotaEditando(null);
  };

  const handleSubmitNota = async (data: NotaFormData) => {
    if (!idUsuario) {
      alert(
        "No se ha iniciado sesión. Por favor, recarga la página después de iniciar sesión."
      );
      return;
    }

    const titulo = data.titulo.trim();
    const contenido = data.contenido?.trim() || undefined;
    const id_transaccion =
      data.id_transaccion != null ? data.id_transaccion : null;

    try {
      if (notaEditando) {
        const updated = await actualizarNota(notaEditando.id_nota, {
          id_usuario: idUsuario,
          titulo,
          contenido,
          id_transaccion,
        });
        if (data.color) {
          saveNoteColor(updated.id_nota, data.color);
          setNotaColors((prev) => ({
            ...prev,
            [updated.id_nota]: data.color as string,
          }));
        }
      } else {
        const created = await crearNota({
          id_usuario: idUsuario,
          titulo,
          contenido,
          id_transaccion,
        });
        if (data.color) {
          saveNoteColor(created.id_nota, data.color);
          setNotaColors((prev) => ({
            ...prev,
            [created.id_nota]: data.color as string,
          }));
        }
      }
      handleCerrarModal();
    } catch {
      // error ya manejado en el hook
    }
  };

  const handleEliminarNota = async (nota: Nota) => {
    const ok = confirm(
      `¿Eliminar la nota \"${nota.titulo}\"? Esta acción no se puede deshacer.`
    );
    if (!ok) return;
    try {
      await eliminarNota(nota.id_nota);      removeNoteColor(nota.id_nota);
      setNotaColors((prev) => {
        const { [nota.id_nota]: _, ...rest } = prev;
        return rest;
      });    } catch {
      // error ya manejado en el hook
    }
  };

  const notasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return notas;
    return notas.filter((n) => {
      const texto = `${n.titulo} ${n.contenido ?? ""}`.toLowerCase();
      return texto.includes(q);
    });
  }, [busqueda, notas]);

  const transaccionPorId = useMemo(() => {
    const map = new Map<number, (typeof transacciones)[number]>();
    for (const t of transacciones) map.set(t.id_transaccion, t);
    return map;
  }, [transacciones]);

  return (
    <MainLayout title="Notas">
      <div className="bg-white min-h-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notas</h1>
            <p className="text-sm text-gray-500 mt-1">
              {notas.length} notas
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Buscar..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500"
              />
            </div>
            <button
              type="button"
              onClick={handleAbrirModal}
              className="h-11 bg-pink-600 hover:bg-pink-700 text-white font-medium px-4 rounded-lg flex items-center gap-2 transition-colors flex-shrink-0"
            >
              <span className="text-lg leading-none">+</span>
              Añadir
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {cargando ? (
          <div className="py-10 text-center text-gray-500">
            Cargando notas...
          </div>
        ) : notasFiltradas.length === 0 ? (
          <div className="py-12 text-center text-gray-500 border border-dashed border-gray-200 rounded-xl">
            <p className="text-base">No hay notas todavía.</p>
            <p className="text-sm mt-1">
              Usa &quot;Añadir&quot; para guardar ideas o recordatorios rápidos.
            </p>
            <button
              type="button"
              onClick={handleAbrirModal}
              className="mt-4 text-pink-600 hover:text-pink-700 font-medium"
            >
              + Crear primera nota
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {notasFiltradas.map((nota, index) => (
              <article
                key={nota.id_nota}
                className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col"
              >
                <div
                  className="h-1.5 w-full"
                  style={{
                    backgroundColor:
                      notaColors[nota.id_nota] ?? obtenerColor(index),
                  }}
                  aria-hidden
                />
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h2 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {nota.titulo}
                    </h2>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleEditarNota(nota)}
                        aria-label="Editar nota"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-500 text-xs"
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEliminarNota(nota)}
                        aria-label="Eliminar nota"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-50 hover:text-red-500 text-gray-500 text-xs"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                  {nota.contenido && (
                    <p className="text-sm text-gray-700 whitespace-pre-line flex-1">
                      {nota.contenido}
                    </p>
                  )}

                  {nota.id_transaccion && (
                    <div className="mt-4 text-xs text-gray-600 border-t border-gray-100 pt-3">
                      {(() => {
                        const t = transaccionPorId.get(nota.id_transaccion);
                        if (!t) {
                          return (
                            <span>
                              Transacción vinculada: #{nota.id_transaccion} (no
                              disponible)
                            </span>
                          );
                        }
                        const tipo = t.tipo === "ingreso" ? "Ingreso" : "Gasto";
                        const monto = String(t.monto);
                        const cat = t.nombre_categoria ?? "—";
                        return (
                          <span>
                            Transacción: {tipo} · {cat} · {monto}
                          </span>
                        );
                      })()}
                    </div>
                  )}
                  <p className="mt-4 text-xs text-gray-500">
                    {formatFecha(nota.fecha_registro)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <AddNota
        isOpen={isModalOpen}
        onClose={handleCerrarModal}
        onSubmit={handleSubmitNota}
        transacciones={transacciones}
        mode={notaEditando ? "edit" : "create"}
        initialData={
          notaEditando
            ? {
                titulo: notaEditando.titulo,
                contenido: notaEditando.contenido || undefined,
                id_transaccion: notaEditando.id_transaccion,
                tipo: (() => {
                  const t = notaEditando.id_transaccion
                    ? transaccionPorId.get(notaEditando.id_transaccion)
                    : undefined;
                  return t?.tipo === "ingreso" ? "ingreso" : "gasto";
                })(),
                color:
                  notaColors[notaEditando.id_nota] ??
                  (notaEditando as any).color ??
                  "#10B981",
              }
            : { tipo: "gasto" }
        }
      />
    </MainLayout>
  );
};

export default Notas;
