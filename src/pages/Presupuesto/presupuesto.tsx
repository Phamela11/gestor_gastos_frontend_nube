import { useState, useEffect } from "react";
import MainLayout from "../../components/Layout/mainLayout";
import AddPresupuesto, {
  PresupuestoFormData,
} from "../../components/Modal/addPresupuesto";
import { usePresupuesto, Presupuesto } from "./usePresupuesto";
import { useCategoria } from "../Categorias/useCategoria";

const formatterCOP =
  typeof Intl !== "undefined" && Intl.NumberFormat
    ? new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : null;

const formatCOP = (valor: number) =>
  formatterCOP
    ? formatterCOP.format(valor)
    : `${valor.toLocaleString("es-CO", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} COP`;

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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

const PresupuestoPage = () => {
  const [idUsuario, setIdUsuario] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [presupuestoEditando, setPresupuestoEditando] =
    useState<Presupuesto | null>(null);

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

  const {
    presupuestos,
    cargando,
    error,
    crearPresupuesto,
    actualizarPresupuesto,
    eliminarPresupuesto,
  } = usePresupuesto(idUsuario);

  const { categorias } = useCategoria(idUsuario);
  const categoriasGasto = categorias
    .filter((c) => c.tipo === "gasto")
    .map((c) => ({
      id_categoria: c.id_categoria,
      nombre_categoria: c.nombre_categoria,
    }));

  // Al crear: solo categorías que aún no tienen presupuesto. Al editar: todas.
  const categoriasParaModal = presupuestoEditando
    ? categoriasGasto
    : categoriasGasto.filter(
        (c) => !presupuestos.some((p) => p.id_categoria === c.id_categoria)
      );

  const handleAbrirModal = () => {
    setPresupuestoEditando(null);
    setIsModalOpen(true);
  };

  const handleEditar = (p: Presupuesto) => {
    setPresupuestoEditando(p);
    setIsModalOpen(true);
  };

  const handleGuardar = async (data: PresupuestoFormData) => {
    if (!idUsuario) {
      alert("No se ha iniciado sesión. Recarga la página después de iniciar sesión.");
      return;
    }

    try {
      if (presupuestoEditando) {
        await actualizarPresupuesto(presupuestoEditando.id_presupuesto, {
          id_usuario: idUsuario,
          id_categoria: data.id_categoria,
          monto_limite: data.monto_limite,
          fecha_inicio: data.fecha_inicio,
          fecha_fin: data.fecha_fin,
        });
      } else {
        await crearPresupuesto({
          id_usuario: idUsuario,
          id_categoria: data.id_categoria,
          monto_limite: data.monto_limite,
          fecha_inicio: data.fecha_inicio,
          fecha_fin: data.fecha_fin,
        });
      }
      setIsModalOpen(false);
      setPresupuestoEditando(null);
    } catch {
      // Error ya manejado en el hook
    }
  };

  const handleEliminar = async (p: Presupuesto) => {
    const ok = confirm(
      `¿Eliminar el presupuesto de "${p.nombre_categoria ?? "esta categoría"}" (${formatCOP(Number(p.monto_limite))})?`
    );
    if (!ok) return;
    try {
      await eliminarPresupuesto(p.id_presupuesto);
    } catch {
      // Error ya manejado en el hook
    }
  };

  const totalLimite = presupuestos.reduce(
    (acc, p) => acc + Number(p.monto_limite),
    0
  );

  return (
    <MainLayout title="Presupuestos">
      <div className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="text-sm text-gray-500">Presupuestos (total límite)</div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">
              {formatCOP(totalLimite)}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="text-sm text-gray-500">Cantidad</div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">
              {presupuestos.length}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="text-sm text-gray-500">Estado</div>
            <div className="mt-3 flex items-center gap-2 text-gray-800">
              <span className="text-emerald-500" aria-hidden="true">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 6 9 17l-5-5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span>
                {presupuestos.length === 0
                  ? "Sin presupuestos definidos"
                  : "Presupuestos activos"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Presupuestos por categoría
            </h2>
            <button
              type="button"
              onClick={handleAbrirModal}
              className="h-11 bg-pink-600 hover:bg-pink-700 text-white font-medium px-4 rounded-lg flex items-center gap-2 transition-colors"
            >
              <span className="text-lg leading-none">+</span>
              Añadir
            </button>
          </div>

          {cargando ? (
            <div className="px-6 py-10 text-center text-gray-500">
              Cargando presupuestos...
            </div>
          ) : presupuestos.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              <p className="text-base">No hay presupuestos.</p>
              <p className="text-sm mt-1">
                Usa &quot;Añadir&quot; para crear un límite de gasto por categoría y rango de fechas.
              </p>
              <button
                type="button"
                onClick={handleAbrirModal}
                className="mt-4 text-pink-600 hover:text-pink-700 font-medium"
              >
                + Crear primer presupuesto
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {presupuestos.map((p, index) => {
                const limite = Number(p.monto_limite);
                const gastado = Number(p.gastado ?? 0);
                const pct =
                  limite > 0 ? Math.min(100, (gastado / limite) * 100) : 0;
                const restante = Math.max(0, limite - gastado);
                return (
                  <div
                    key={p.id_presupuesto}
                    className="px-6 py-5 hover:bg-white transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: obtenerColor(index),
                          }}
                          aria-hidden
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {p.nombre_categoria ?? `Categoría #${p.id_categoria}`}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(p.fecha_inicio)} – {formatDate(p.fecha_fin)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-label="Editar presupuesto"
                          onClick={() => handleEditar(p)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors text-gray-500"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden
                          >
                            <path
                              d="M12 20h9"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                            <path
                              d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          aria-label="Eliminar presupuesto"
                          onClick={() => handleEliminar(p)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white hover:bg-gray-50 hover:text-red-500 transition-colors text-gray-500"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden
                          >
                            <path
                              d="M4 7h16"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                            <path
                              d="M10 11v6M14 11v6"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                            <path
                              d="M6 7l1 14h10l1-14"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M9 7V4h6v3"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="h-2.5 w-full rounded-full bg-gray-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-[width] ${
                            pct >= 100
                              ? "bg-red-500"
                              : pct >= 80
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                          }`}
                          style={{ width: `${pct}%` }}
                          aria-hidden
                        />
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-4 text-xs text-gray-500">
                        <span>
                          {formatCOP(gastado)} de {formatCOP(limite)}
                        </span>
                        <span>Restante: {formatCOP(restante)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AddPresupuesto
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setPresupuestoEditando(null);
        }}
        onSubmit={handleGuardar}
        categoriasGasto={categoriasParaModal}
        mode={presupuestoEditando ? "edit" : "create"}
        initialData={
          presupuestoEditando
            ? {
                id_categoria: presupuestoEditando.id_categoria,
                monto_limite: Number(presupuestoEditando.monto_limite),
                fecha_inicio: presupuestoEditando.fecha_inicio,
                fecha_fin: presupuestoEditando.fecha_fin,
              }
            : undefined
        }
      />
    </MainLayout>
  );
};

export default PresupuestoPage;
