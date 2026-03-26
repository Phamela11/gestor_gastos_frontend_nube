import { useEffect, useState } from "react";
import MainLayout from "../../components/Layout/mainLayout";
import { useTransaccion, Transaccion } from "./useTransaccion";
import { useCategoria, Categoria } from "../Categorias/useCategoria";
import AddTransaccion, {
  TransaccionFormData,
} from "../../components/Modal/addTransaccion";
import BudgetWarning from "../../components/Modal/budgetWarning";

const coloresBase = [
  "#10B981",
  "#3B82F6",
  "#8B5CF6",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
  "#EC4899",
];

const obtenerColorBase = (index: number) =>
  coloresBase[index % coloresBase.length];

const formatearFecha = (fecha: string) => {
  if (!fecha) return "";
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return fecha;
  return d.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatearMonto = (monto: number | string, tipo: "gasto" | "ingreso") => {
  const num = Number(monto);
  const valor = Number.isNaN(num) ? 0 : num;
  const abs = Math.abs(valor);

  const formatter =
    typeof Intl !== "undefined" && Intl.NumberFormat
      ? new Intl.NumberFormat("es-CO", {
          style: "currency",
          currency: "COP",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : null;

  const texto = formatter
    ? formatter.format(abs)
    : `${abs.toLocaleString("es-CO", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} COP`;

  const signo = tipo === "ingreso" ? "+" : "-";
  return `${signo} ${texto}`;
};

const Transacciones = () => {
  const [idUsuario, setIdUsuario] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBudgetWarningOpen, setIsBudgetWarningOpen] = useState(false);
  const [budgetWarningMessage, setBudgetWarningMessage] = useState("");
  const [transaccionPendiente, setTransaccionPendiente] = useState<{
    idTransaccion: number;
    datos: TransaccionFormData;
  } | null>(null);
  const [categoriaColors, setCategoriaColors] = useState<Record<number, string>>({});

  const [filtroTipo, setFiltroTipo] = useState<"todos" | "ingreso" | "gasto">("todos");
  const [filtroCategoria, setFiltroCategoria] = useState<number | "todos">("todos");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const usuarioStr = localStorage.getItem("usuario");
    if (usuarioStr) {
      const usuario = JSON.parse(usuarioStr);
      setIdUsuario(usuario.id_usuario);
    }
  }, []);

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

  const {
    transacciones,
    cargando: cargandoTransacciones,
    error: errorTransacciones,
    crearTransaccion,
    eliminarTransaccion,
  } = useTransaccion(idUsuario);

  const {
    categorias,
    error: errorCategorias,
    cargando: cargandoCategorias,
  } = useCategoria(idUsuario);

  const getCategoriaDeTransaccion = (t: Transaccion): Categoria | undefined =>
    categorias.find((c) => c.id_categoria === t.id_categoria);

  const getTipoTransaccion = (t: Transaccion): "gasto" | "ingreso" => {
    if (t.tipo === "gasto" || t.tipo === "ingreso") return t.tipo;
    const cat = getCategoriaDeTransaccion(t);
    return cat?.tipo === "ingreso" ? "ingreso" : "gasto";
  };

  const getNombreCategoria = (t: Transaccion): string => {
    if (t.nombre_categoria) return t.nombre_categoria;
    const cat = getCategoriaDeTransaccion(t);
    return cat?.nombre_categoria ?? "Sin categoría";
  };

  const getColorCategoria = (t: Transaccion, index: number) => {
    const guardado = categoriaColors[t.id_categoria];
    if (guardado) return guardado;
    return obtenerColorBase(index);
  };

  const transaccionesFiltradas = transacciones.filter((t) => {
    const tipo = getTipoTransaccion(t);

    if (filtroTipo !== "todos" && tipo !== filtroTipo) {
      return false;
    }

    if (filtroCategoria !== "todos" && t.id_categoria !== filtroCategoria) {
      return false;
    }

    const textoBusqueda = busqueda.trim().toLowerCase();
    if (textoBusqueda) {
      const nombreCat = getNombreCategoria(t).toLowerCase();
      const descripcion = (t.descripcion ?? "").toLowerCase();
      if (!nombreCat.includes(textoBusqueda) && !descripcion.includes(textoBusqueda)) {
        return false;
      }
    }

    return true;
  });

  const handleAbrirModal = () => {
    if (!idUsuario) {
      alert(
        "No se ha iniciado sesión. Por favor, recarga la página después de iniciar sesión."
      );
      return;
    }
    setIsModalOpen(true);
  };

  const handleCrearTransaccion = async (data: TransaccionFormData) => {
    if (!idUsuario) {
      alert(
        "No se ha iniciado sesión. Por favor, recarga la página después de iniciar sesión."
      );
      return;
    }

    try {
      const resultado = await crearTransaccion({
        id_usuario: idUsuario,
        id_categoria: data.id_categoria,
        monto: data.monto,
        descripcion: data.descripcion,
      });
      
      setIsModalOpen(false);
      
      // Si se supera el presupuesto, mostrar modal en lugar de alert
      if (resultado.presupuestoSuperado && resultado.mensajePresupuesto) {
        setBudgetWarningMessage(resultado.mensajePresupuesto);
        setTransaccionPendiente({
          idTransaccion: resultado.idTransaccion!,
          datos: data,
        });
        setIsBudgetWarningOpen(true);
      }
    } catch (error: any) {
      alert(error.message || "Error al crear transacción");
    }
  };

  const handleAceptarPresupuesto = () => {
    // El usuario acepta la transacción a pesar de superar el presupuesto
    setIsBudgetWarningOpen(false);
    setTransaccionPendiente(null);
    // La transacción ya fue creada, solo cerramos el modal
  };

  const handleCancelarPresupuesto = async () => {
    // El usuario cancela, debemos eliminar la transacción creada
    if (transaccionPendiente && idUsuario) {
      try {
        await eliminarTransaccion(transaccionPendiente.idTransaccion);
      } catch (error: any) {
        alert("Error al cancelar la transacción: " + (error.message || "desconocido"));
      }
    }
    setIsBudgetWarningOpen(false);
    setTransaccionPendiente(null);
  };

  const handleEliminarTransaccion = async (t: Transaccion) => {
    if (!idUsuario) {
      alert(
        "No se ha iniciado sesión. Por favor, recarga la página después de iniciar sesión."
      );
      return;
    }

    const ok = confirm(
      `¿Eliminar la transacción "${t.descripcion || getNombreCategoria(t)}"? Esta acción no se puede deshacer.`
    );
    if (!ok) return;

    try {
      await eliminarTransaccion(t.id_transaccion);
    } catch (error: any) {
      alert(error.message || "Error al eliminar transacción");
    }
  };

  return (
    <MainLayout title="Transacciones">
      <div className="space-y-6">
        {errorTransacciones && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {errorTransacciones}
          </div>
        )}
        {errorCategorias && (
          <div className="bg-yellow-50 border border-yellow-400 text-yellow-800 px-4 py-3 rounded">
            {errorCategorias}
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M16.2 16.2 21 21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <input
              placeholder="Buscar transacciones..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg pl-11 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
            />
          </div>

          <button
            type="button"
            aria-label="Filtros"
            className="h-11 w-11 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors flex items-center justify-center text-gray-600"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M4 5h16l-6.5 7.5V19l-3 1v-7.5L4 5Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="flex items-center gap-3">
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value as "todos" | "ingreso" | "gasto")}
              className="h-11 bg-white border border-gray-300 rounded-lg px-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
            >
              <option value="todos">Todos</option>
              <option value="ingreso">Ingresos</option>
              <option value="gasto">Gastos</option>
            </select>

            <select
              value={filtroCategoria}
              onChange={(e) =>
                setFiltroCategoria(
                  e.target.value === "todos" ? "todos" : Number(e.target.value)
                )
              }
              className="h-11 bg-white border border-gray-300 rounded-lg px-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
            >
              <option value="todos">Todas las categorias</option>
              {categorias.map((categoria) => (
                <option key={categoria.id_categoria} value={categoria.id_categoria}>
                  {categoria.nombre_categoria}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="h-11 bg-pink-600 hover:bg-pink-700 text-white font-medium px-5 rounded-lg flex items-center gap-2 transition-colors"
              onClick={handleAbrirModal}
            >
              <span className="text-lg leading-none">+</span>
              Nueva
            </button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-baseline gap-2">
            <h2 className="text-lg font-semibold text-gray-900">
              Historial de Transacciones
            </h2>
            <span className="text-sm text-gray-500">
              ({transaccionesFiltradas.length} resultados)
            </span>
          </div>

          {cargandoTransacciones || cargandoCategorias ? (
            <div className="py-10 text-center text-gray-500">
              Cargando transacciones...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-200">
                    <th className="py-3 px-6 font-medium">Fecha</th>
                    <th className="py-3 px-6 font-medium">Categoria</th>
                    <th className="py-3 px-6 font-medium">Descripción</th>
                    <th className="py-3 px-6 font-medium text-right">Monto</th>
                    <th className="py-3 px-6 font-medium text-right">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {transaccionesFiltradas.map((t, index) => {
                    const tipo = getTipoTransaccion(t);
                    const nombreCategoria = getNombreCategoria(t);
                    const colorCategoria = getColorCategoria(t, index);

                    return (
                      <tr
                        key={t.id_transaccion}
                        className="border-b border-gray-100 hover:bg-white transition-colors"
                      >
                        <td className="py-4 px-6 text-gray-700 whitespace-nowrap">
                          {formatearFecha(t.fecha_registro)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: colorCategoria }}
                              aria-hidden="true"
                            />
                            <span className="text-gray-900">
                              {nombreCategoria}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-900">
                          {t.descripcion || "—"}
                        </td>
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <span
                            className={[
                              "inline-flex items-center gap-2 font-semibold",
                              tipo === "ingreso"
                                ? "text-green-600"
                                : "text-red-600",
                            ].join(" ")}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              aria-hidden="true"
                            >
                              {tipo === "ingreso" ? (
                                <path
                                  d="M7 17 17 7M17 7H10M17 7v7"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              ) : (
                                <path
                                  d="M7 7l10 10M17 17H10m7 0v-7"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              )}
                            </svg>
                            {formatearMonto(t.monto, tipo)}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            type="button"
                            aria-label="Eliminar transacción"
                            onClick={() => handleEliminarTransaccion(t)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white hover:bg-gray-50 hover:text-red-500 transition-colors text-gray-500"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              aria-hidden="true"
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
                        </td>
                      </tr>
                    );
                  })}

                  {transacciones.length === 0 && !cargandoTransacciones && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-6 px-6 text-center text-gray-500"
                      >
                        No hay transacciones registradas todavía.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <AddTransaccion
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCrearTransaccion}
        categorias={categorias}
      />

      <BudgetWarning
        isOpen={isBudgetWarningOpen}
        mensaje={budgetWarningMessage}
        onCancel={handleCancelarPresupuesto}
        onAccept={handleAceptarPresupuesto}
      />
    </MainLayout>
  );
};

export default Transacciones;



