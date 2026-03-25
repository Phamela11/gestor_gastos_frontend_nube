import { useEffect, useMemo, useState } from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import MainLayout from "../../components/Layout/mainLayout";import { useCategoria } from "../Categorias/useCategoria";import { useTransaccion } from "../Transacciones/useTransaccion";
import { usePresupuesto } from "../Presupuesto/usePresupuesto";

const COLORS = [
  "#6366F1",
  "#10B981",
  "#3B82F6",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
  "#8B5CF6",
  "#F97316",
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);

const Reporte = () => {
  const [idUsuario, setIdUsuario] = useState<number | null>(null);
  const [categoriaColors, setCategoriaColors] = useState<Record<number, string>>({});

  useEffect(() => {
    const usuarioStr = localStorage.getItem("usuario");
    if (!usuarioStr) {
      setIdUsuario(null);
      return;
    }

    try {
      const usuario = JSON.parse(usuarioStr);
      setIdUsuario(usuario.id_usuario ?? null);
    } catch {
      setIdUsuario(null);
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

  const { transacciones, cargando, error } = useTransaccion(idUsuario);
  const { categorias } = useCategoria(idUsuario);
  const { presupuestos } = usePresupuesto(idUsuario);

  const categoriaInfoById = useMemo(() => {
    const map = new Map<number, { nombre: string; color?: string }>();
    categorias.forEach((c) => {
      map.set(c.id_categoria, {
        nombre: c.nombre_categoria,
        color: categoriaColors[c.id_categoria],
      });
    });
    return map;
  }, [categorias, categoriaColors]);

  const totalIngresos = useMemo(() => {
    return transacciones
      .filter((t) => t.tipo === "ingreso")
      .reduce((sum, t) => sum + (Number(t.monto) || 0), 0);
  }, [transacciones]);

  const totalGastos = useMemo(() => {
    return transacciones
      .filter((t) => t.tipo === "gasto")
      .reduce((sum, t) => sum + (Number(t.monto) || 0), 0);
  }, [transacciones]);

  const gastosPorCategoria = useMemo(() => {
    type Entry = { nombre: string; total: number };
    const map = new Map<number, Entry>();
    for (const t of transacciones) {
      if (t.tipo !== "gasto") continue;
      const categoriaId = t.id_categoria ?? 0;
      const nombre =
        t.nombre_categoria ?? categoriaInfoById.get(categoriaId)?.nombre ??
        "Sin categoría";
      const monto = Number(t.monto) || 0;

      const existing = map.get(categoriaId);
      if (existing) {
        existing.total += monto;
      } else {
        map.set(categoriaId, { nombre, total: monto });
      }
    }
    return Array.from(map, ([id_categoria, { nombre, total }]) => ({
      id_categoria,
      categoria: nombre,
      total,
    }));
  }, [transacciones]);

  const ingresosPorCategoria = useMemo(() => {
    type Entry = { nombre: string; total: number };
    const map = new Map<number, Entry>();
    for (const t of transacciones) {
      if (t.tipo !== "ingreso") continue;
      const categoriaId = t.id_categoria ?? 0;
      const nombre =
        t.nombre_categoria ?? categoriaInfoById.get(categoriaId)?.nombre ??
        "Sin categoría";
      const monto = Number(t.monto) || 0;

      const existing = map.get(categoriaId);
      if (existing) {
        existing.total += monto;
      } else {
        map.set(categoriaId, { nombre, total: monto });
      }
    }
    return Array.from(map, ([id_categoria, { nombre, total }]) => ({
      id_categoria,
      categoria: nombre,
      total,
    }));
  }, [transacciones]);


  const sortedGastos = useMemo(() => {
    return [...gastosPorCategoria].sort((a, b) => b.total - a.total);
  }, [gastosPorCategoria]);

  const totalGastosPorCategoria = useMemo(() => {
    return sortedGastos.reduce((sum, item) => sum + item.total, 0);
  }, [sortedGastos]);

  return (
    <MainLayout title="Reportes">
      <div className="space-y-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
            <p className="text-sm text-gray-600 mt-1">
              Estadísticas de tus ingresos y gastos por categoría.
            </p>
          </div>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {cargando ? (
          <div className="py-10 text-center text-gray-500">Cargando...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Ingresos</p>
                    <p className="mt-2 text-3xl font-semibold text-emerald-600">
                      {formatCurrency(totalIngresos)}
                    </p>
                  </div>
                  <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-emerald-100 text-emerald-700">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 12L14 2L14 7H20V17H14V22L4 12Z" fill="#059669"/>
                    </svg>
                  </span>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Gastos</p>
                    <p className="mt-2 text-3xl font-semibold text-red-600">
                      {formatCurrency(totalGastos)}
                    </p>
                  </div>
                  <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-red-100 text-red-700">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 12L10 22V17H4V7H10V2L20 12Z" fill="#B91C1C"/>
                    </svg>
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Gastos por categoría
                </h2>
                {gastosPorCategoria.length === 0 ? (
                  <p className="text-sm text-gray-500">No hay gastos registrados.</p>
                ) : (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={gastosPorCategoria}
                          dataKey="total"
                          nameKey="categoria"
                          innerRadius={60}
                          outerRadius={96}
                          fill="#EF4444"
                          paddingAngle={4}
                        >
                          {gastosPorCategoria.map((item, index) => {
                            const color =
                              categoriaColors[item.id_categoria] ||
                              COLORS[index % COLORS.length];
                            return <Cell key={`cell-${index}`} fill={color} />;
                          })}
                        </Pie>
                        <Tooltip
                          formatter={(value) => formatCurrency(Number(value || 0))}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Ingresos por categoría
                </h2>
                {ingresosPorCategoria.length === 0 ? (
                  <p className="text-sm text-gray-500">No hay ingresos registrados.</p>
                ) : (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={ingresosPorCategoria}
                          dataKey="total"
                          nameKey="categoria"
                          innerRadius={60}
                          outerRadius={96}
                          fill="#10B981"
                          paddingAngle={4}
                        >
                          {ingresosPorCategoria.map((item, index) => {
                            const color =
                              categoriaColors[item.id_categoria] ||
                              COLORS[index % COLORS.length];
                            return <Cell key={`cell-${index}`} fill={color} />;
                          })}
                        </Pie>
                        <Tooltip
                          formatter={(value) => formatCurrency(Number(value || 0))}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            {presupuestos.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Reporte de Presupuestos por Categoría
                </h2>
                <div className="space-y-6">
                  {presupuestos.map((presupuesto) => {
                    const limite = Number(presupuesto.monto_limite) || 0;
                    const gastado = Number(presupuesto.gastado) || 0;
                    const porcentaje = limite > 0 ? (gastado / limite) * 100 : 0;
                    
                    let colorBarra = "bg-emerald-500"; // Verde por defecto
                    let colorTexto = "text-emerald-600";
                    
                    if (porcentaje >= 100) {
                      colorBarra = "bg-red-500";
                      colorTexto = "text-red-600";
                    } else if (porcentaje >= 80) {
                      colorBarra = "bg-amber-500";
                      colorTexto = "text-amber-600";
                    }

                    const restante = Math.max(0, limite - gastado);

                    return (
                      <div
                        key={presupuesto.id_presupuesto}
                        className="border border-gray-100 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {presupuesto.nombre_categoria || "Sin categoría"}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Del {new Date(presupuesto.fecha_inicio).toLocaleDateString(
                                "es-ES"
                              )}{" "}
                              al {new Date(presupuesto.fecha_fin).toLocaleDateString(
                                "es-ES"
                              )}
                            </p>
                          </div>
                          <span
                            className={`text-lg font-bold ${colorTexto}`}
                          >
                            {porcentaje.toFixed(1)}%
                          </span>
                        </div>

                        <div className="flex gap-6 mb-3">
                          <div>
                            <p className="text-xs text-gray-500 font-medium">
                              PRESUPUESTADO
                            </p>
                            <p className="text-lg font-semibold text-gray-900">
                              {formatCurrency(limite)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">GASTADO</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {formatCurrency(gastado)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">DISPONIBLE</p>
                            <p
                              className={`text-lg font-semibold ${
                                restante >= 0 ? "text-emerald-600" : "text-red-600"
                              }`}
                            >
                              {formatCurrency(restante)}
                            </p>
                          </div>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-3 rounded-full transition-all ${colorBarra}`}
                            style={{
                              width: `${Math.min(porcentaje, 100)}%`,
                            }}
                          />
                        </div>
                        
                        {porcentaje > 100 && (
                          <p className="text-sm text-red-600 mt-2 font-medium">
                            ⚠️ Has excedido el presupuesto por{" "}
                            {formatCurrency(gastado - limite)}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Desglose de gastos</h2>
              {sortedGastos.length === 0 ? (
                <p className="text-sm text-gray-500">No hay gastos registrados.</p>
              ) : (
                <div className="space-y-4">
                  {sortedGastos.map((item) => {
                    const pct = totalGastosPorCategoria
                      ? (item.total / totalGastosPorCategoria) * 100
                      : 0;
                    return (
                      <div key={item.categoria} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{
                              backgroundColor:
                                categoriaColors[item.id_categoria] ||
                                COLORS[sortedGastos.indexOf(item) % COLORS.length],
                            }}
                          />
                          <span className="text-sm font-medium text-gray-700">
                            {item.categoria}
                          </span>
                        </div>
                        <div className="flex-1 mx-4 bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${Math.min(pct, 100)}%`,
                              backgroundColor:
                                categoriaColors[item.id_categoria] ||
                                COLORS[sortedGastos.indexOf(item) % COLORS.length],
                            }}
                          />
                        </div>
                        <div className="text-sm text-gray-600 text-right">
                          <div>{pct.toFixed(1)}%</div>
                          <div className="font-semibold">
                            {formatCurrency(item.total)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Reporte;



