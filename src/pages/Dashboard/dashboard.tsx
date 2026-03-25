import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import MainLayout from "../../components/Layout/mainLayout";
import { useCategoria } from "../Categorias/useCategoria";
import { useTransaccion } from "../Transacciones/useTransaccion";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);

const monthKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};

const monthLabel = (key: string) => {
  const [y, m] = key.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString("es-CO", { month: "short", year: "numeric" });
};

const getLastMonths = (count: number) => {
  const now = new Date();
  const months: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(monthKey(d));
  }
  return months;
};

const Dashboard = () => {
  const [idUsuario, setIdUsuario] = useState<number | null>(null);

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

  const { transacciones, cargando, error } = useTransaccion(idUsuario);
  const { categorias } = useCategoria(idUsuario);

  const categoriaMap = useMemo(() => {
    const map = new Map<number, { nombre: string; color?: string; tipo: string }>();
    categorias.forEach((c) => {
      map.set(c.id_categoria, {
        nombre: c.nombre_categoria,
        color: (c as any).color,
        tipo: c.tipo,
      });
    });
    return map;
  }, [categorias]);

  const resumen = useMemo(() => {
    const ingresos = transacciones
      .filter((t) => t.tipo === "ingreso")
      .reduce((sum, t) => sum + (Number(t.monto) || 0), 0);
    const gastos = transacciones
      .filter((t) => t.tipo === "gasto")
      .reduce((sum, t) => sum + (Number(t.monto) || 0), 0);
    return {
      ingresos,
      gastos,
      balance: ingresos - gastos,
    };
  }, [transacciones]);

  const ultimoMesKey = useMemo(() => {
    const now = new Date();
    return monthKey(now);
  }, []);

  const mesAnteriorKey = useMemo(() => {
    const now = new Date();
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return monthKey(prev);
  }, []);

  const ingresosPorMes = useMemo(() => {
    const map = new Map<string, number>();
    transacciones.forEach((t) => {
      const d = new Date(t.fecha_registro);
      const key = monthKey(d);
      if (!map.has(key)) map.set(key, 0);
      if (t.tipo === "ingreso") {
        map.set(key, (map.get(key) ?? 0) + (Number(t.monto) || 0));
      }
    });
    return map;
  }, [transacciones]);

  const gastosPorMes = useMemo(() => {
    const map = new Map<string, number>();
    transacciones.forEach((t) => {
      const d = new Date(t.fecha_registro);
      const key = monthKey(d);
      if (!map.has(key)) map.set(key, 0);
      if (t.tipo === "gasto") {
        map.set(key, (map.get(key) ?? 0) + (Number(t.monto) || 0));
      }
    });
    return map;
  }, [transacciones]);

  const meses = useMemo(() => getLastMonths(6), []);

  const tendenciaData = useMemo(() => {
    return meses.map((m) => ({
      mes: monthLabel(m),
      ingresos: ingresosPorMes.get(m) ?? 0,
      gastos: gastosPorMes.get(m) ?? 0,
    }));
  }, [meses, ingresosPorMes, gastosPorMes]);

  const cambioMes = useMemo(() => {
    const currentIngresos = ingresosPorMes.get(ultimoMesKey) ?? 0;
    const prevIngresos = ingresosPorMes.get(mesAnteriorKey) ?? 0;
    const currentGastos = gastosPorMes.get(ultimoMesKey) ?? 0;
    const prevGastos = gastosPorMes.get(mesAnteriorKey) ?? 0;

    const ingresoPct = prevIngresos ? (currentIngresos - prevIngresos) / prevIngresos : 0;
    const gastoPct = prevGastos ? (currentGastos - prevGastos) / prevGastos : 0;

    return {
      ingresos: ingresoPct,
      gastos: gastoPct,
    };
  }, [ingresosPorMes, gastosPorMes, ultimoMesKey, mesAnteriorKey]);

  const transaccionesRecientes = useMemo(() => {
    return [...transacciones]
      .sort((a, b) => new Date(b.fecha_registro).getTime() - new Date(a.fecha_registro).getTime())
      .slice(0, 6);
  }, [transacciones]);

  const formatDate = (fecha: string) => {
    const d = new Date(fecha);
    if (Number.isNaN(d.getTime())) return fecha;
    return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short" });
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">
              Resumen de tu actividad financiera (últimos 6 meses).
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-500">Balance Total</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {formatCurrency(resumen.balance)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {resumen.balance >= 0 ? "Positivo" : "Negativo"}
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-500">Ingresos</p>
                <p className="mt-2 text-3xl font-semibold text-emerald-600">
                  {formatCurrency(resumen.ingresos)}
                </p>
                <p className="text-xs text-emerald-600 mt-1">
                  {cambioMes.ingresos >= 0 ? "+" : ""}
                  {(cambioMes.ingresos * 100).toFixed(1)}% vs mes anterior
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-500">Gastos</p>
                <p className="mt-2 text-3xl font-semibold text-red-600">
                  {formatCurrency(resumen.gastos)}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  {cambioMes.gastos >= 0 ? "+" : ""}
                  {(cambioMes.gastos * 100).toFixed(1)}% vs mes anterior
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen mensual</h2>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={tendenciaData} margin={{ top: 10, right: 20, bottom: 30, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#6B7280" }} />
                      <YAxis tickFormatter={(value) => formatCurrency(Number(value || 0))} tick={{ fontSize: 12, fill: "#6B7280" }} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value || 0))} />
                      <Legend verticalAlign="top" height={36} />
                      <Area type="monotone" dataKey="ingresos" stroke="#10B981" fill="#D1FAE5" name="Ingresos" />
                      <Area type="monotone" dataKey="gastos" stroke="#EF4444" fill="#FEE2E2" name="Gastos" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Transacciones recientes</h2>
                <div className="space-y-3">
                  {transaccionesRecientes.length === 0 ? (
                    <p className="text-sm text-gray-500">No hay transacciones aún.</p>
                  ) : (
                    transaccionesRecientes.map((t) => {
                      const categoria = categoriaMap.get(t.id_categoria);
                      const color = categoria?.color ?? "#CBD5E1";
                      return (
                        <div
                          key={t.id_transaccion}
                          className="flex items-center justify-between gap-4 p-3 rounded-xl border border-gray-100 hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className="h-9 w-9 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: `${color}22` }}
                            >
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                            </span>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{t.descripcion || categoria?.nombre || "Transacción"}</div>
                              <div className="text-xs text-gray-500">
                                {categoria?.nombre ?? "Sin categoría"} · {formatDate(t.fecha_registro)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`text-sm font-semibold ${
                                t.tipo === "ingreso" ? "text-emerald-600" : "text-red-600"
                              }`}
                            >
                              {t.tipo === "ingreso" ? "+" : "-"}
                              {formatCurrency(Number(t.monto))}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Dashboard;
