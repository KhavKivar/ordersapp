import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  BarChart3,
  Calendar,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card } from "@/components/ui/Card/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { getRevenue } from "@/features/revenue/api/get-revenue";
import type { Revenue } from "@/features/revenue/api/revenue-schema";
import { formatChileanPeso } from "@/utils/format-currency";

// --- Tipos y Constantes ---

type WeeklyGain = {
  label: string;
  gain: number;
  start: Date;
};

type DailyGain = {
  label: string;
  gain: number;
  date: Date;
};

const chartConfig = {
  gain: {
    label: "Ganancias",
    color: "#f97316", // Orange-500
  },
} satisfies ChartConfig;

const MONTHS_SHORT = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

// --- Helpers de Fecha y Datos ---

const parseRevenueDate = (value: string) => {
  const [day, month, year] = value.split("/").map(Number);
  if (!day || !month || !year) return null;
  return new Date(year, month - 1, day);
};

const formatShortDate = (date: Date) =>
  `${String(date.getDate()).padStart(2, "0")} ${MONTHS_SHORT[date.getMonth()]}`;

const getWeekStart = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Ajustar al Lunes
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const normalizeRevenue = (entries: Revenue[]) => {
  const dailyMap = new Map<string, DailyGain>();

  entries.forEach((entry) => {
    const date = parseRevenueDate(entry.day);
    if (!date) return;

    // Key única YYYY-MM-DD para agrupar mismo día si fuera necesario
    const key = date.toISOString().split("T")[0];
    const gain = Number(entry.totalGain) || 0;

    const existing = dailyMap.get(key);
    if (existing) {
      existing.gain += gain;
    } else {
      dailyMap.set(key, { date, label: entry.day, gain });
    }
  });

  // Ordenar días: más reciente primero
  const dailyGains = Array.from(dailyMap.values()).sort(
    (a, b) => b.date.getTime() - a.date.getTime(),
  );

  // Agrupar por semanas
  const weeklyMap = new Map<number, WeeklyGain>();

  // Para el gráfico, queremos orden cronológico (antiguo -> nuevo), así que invertimos temporalmente
  const chronologicalDays = [...dailyGains].reverse();

  chronologicalDays.forEach((entry) => {
    const weekStart = getWeekStart(entry.date);
    const weekKey = weekStart.getTime();

    const existing = weeklyMap.get(weekKey);
    if (existing) {
      existing.gain += entry.gain;
    } else {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      const label = `${formatShortDate(weekStart)} - ${formatShortDate(weekEnd)}`;

      weeklyMap.set(weekKey, {
        label,
        gain: entry.gain,
        start: weekStart,
      });
    }
  });

  const weeklyGains = Array.from(weeklyMap.values()).sort(
    (a, b) => a.start.getTime() - b.start.getTime(),
  );

  // Calcular KPIs
  const totalRevenue = dailyGains.reduce((acc, curr) => acc + curr.gain, 0);
  const bestDay = dailyGains.reduce(
    (max, curr) => (curr.gain > max.gain ? curr : max),
    { gain: 0, label: "-" },
  );
  const averageDaily =
    dailyGains.length > 0 ? totalRevenue / dailyGains.length : 0;

  return {
    dailyGains,
    weeklyGains,
    kpis: { totalRevenue, bestDay, averageDaily },
  };
};

// --- Componente Principal ---

export default function StatsPage() {
  const { data, isPending, error } = useQuery({
    queryKey: ["revenue"],
    queryFn: getRevenue,
  });

  const { dailyGains, weeklyGains, kpis } = useMemo(
    () => normalizeRevenue(data?.revenue ?? []),
    [data],
  );

  if (isPending) return <StatsSkeleton />;

  if (error) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <div className="rounded-full bg-red-100 p-4 text-red-600">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">
            Error al cargar datos
          </h3>
          <p className="text-sm text-slate-500">
            No pudimos obtener la información de ingresos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 pb-12 pt-8 sm:pt-12 lg:pt-16">
        {/* HEADER */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Reporte de Ganancias
          </h1>
          <p className="text-slate-500">Resumen financiero semanal y diario.</p>
        </div>

        {dailyGains.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-16 text-center border-dashed">
            <div className="bg-slate-100 p-4 rounded-full mb-4">
              <BarChart3 className="h-8 w-8 text-slate-400" />
            </div>
            <p className="font-medium text-slate-900">
              No hay datos registrados
            </p>
            <p className="text-sm text-slate-500">
              Comienza a registrar ventas para ver estadísticas.
            </p>
          </Card>
        ) : (
          <>
            {/* KPI CARDS */}
            <div className="grid gap-4 sm:grid-cols-3">
              <KpiCard
                title="Ganancia Total"
                value={formatChileanPeso(kpis.totalRevenue)}
                icon={DollarSign}
                trend="Acumulado"
              />
              <KpiCard
                title="Mejor Día"
                value={formatChileanPeso(kpis.bestDay.gain)}
                subValue={kpis.bestDay.label}
                icon={TrendingUp}
                trend="Récord"
                trendColor="text-emerald-600"
              />
              <KpiCard
                title="Promedio Diario"
                value={formatChileanPeso(kpis.averageDaily)}
                icon={BarChart3}
                trend="Estimado"
              />
            </div>

            {/* CHART SECTION */}
            <Card className="p-6 sm:p-8 rounded-3xl border-slate-200 shadow-sm">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">
                  Tendencia Semanal
                </h3>
                <p className="text-sm text-slate-500">
                  Comparativa de ingresos por semana
                </p>
              </div>

              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart
                  data={weeklyGains}
                  margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={12}
                    fontSize={12}
                    tick={{ fill: "#64748b" }}
                    minTickGap={30}
                  />
                  <YAxis
                    hide // Ocultamos el eje Y para limpieza visual (el tooltip da el dato exacto)
                  />
                  <ChartTooltip
                    cursor={{ fill: "rgba(249, 115, 22, 0.1)", radius: 4 }}
                    content={
                      <ChartTooltipContent
                        className="bg-white border-slate-200 shadow-xl"
                        formatter={(value) => (
                          <span className="font-bold text-slate-900">
                            {formatChileanPeso(Number(value))}
                          </span>
                        )}
                      />
                    }
                  />
                  <Bar
                    dataKey="gain"
                    fill="var(--color-gain)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={60}
                  />
                </BarChart>
              </ChartContainer>
            </Card>

            {/* LISTA DETALLADA */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 px-1">
                Detalle Diario
              </h3>
              <Card className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="divide-y divide-slate-100">
                  {dailyGains.map((entry) => (
                    <div
                      key={entry.label}
                      className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-slate-50/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 capitalize">
                            {entry.date.toLocaleDateString("es-CL", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                            })}
                          </p>
                          <p className="text-xs text-slate-400">
                            Registro manual
                          </p>
                        </div>
                      </div>
                      <span className="font-mono font-semibold text-slate-900">
                        {formatChileanPeso(entry.gain)}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// --- Sub-componentes Visuales ---

function KpiCard({
  title,
  value,
  subValue,
  icon: Icon,
  trend,
  trendColor = "text-slate-500",
}: any) {
  return (
    <Card className="relative overflow-hidden p-6 rounded-3xl border-slate-200 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">{value}</h3>
          {subValue && (
            <p className="text-xs text-slate-400 mt-1">{subValue}</p>
          )}
        </div>
        <div className="rounded-xl bg-orange-50 p-2 text-orange-600">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-1 text-xs font-medium">
          <span className={trendColor}>{trend}</span>
        </div>
      )}
    </Card>
  );
}

function StatsSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 pb-12 pt-8 sm:pt-12 lg:pt-16 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded-lg"></div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-3xl"></div>
          ))}
        </div>
        <div className="h-[300px] bg-slate-200 rounded-3xl"></div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
