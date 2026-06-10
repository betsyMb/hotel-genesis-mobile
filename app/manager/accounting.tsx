import { useMemo, useState } from "react";
import { ScrollView, View, TouchableOpacity, Dimensions } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/use-theme";
import { useReservations, useRooms, useOccupancies, useServices, useExchangeRate } from "@/hooks";
import { MaterialIcons } from "@expo/vector-icons";
import { Reservation, Room } from "@/hooks/api/types";
import { BarChart } from "react-native-chart-kit";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

type Period = "all" | "month" | "quarter" | "year";

const screenWidth = Dimensions.get("window").width - 40;

export default function ManagerAccountingScreen() {
  const { data: reservations } = useReservations();
  const { data: rooms } = useRooms();
  const { data: occupancies } = useOccupancies();
  const { data: services } = useServices();
  const { data: exchangeRate } = useExchangeRate();
  const { resolvedTheme } = useTheme();

  const toBs = (amount: number) => {
    const num = Number(amount);
    const safe = isFinite(num) ? num : 0;
    return exchangeRate
      ? `Bs. ${(safe * exchangeRate).toLocaleString("es-ES", { maximumFractionDigits: 2 })}`
      : `$${safe.toLocaleString()}`;
  };

  const formatReservation = (r: Reservation) => {
    if ((r.reservation_status === "completed" || r.reservation_status === "cancelled") && r.total_amount_bs) {
      return `Bs. ${Number(r.total_amount_bs).toLocaleString("es-ES", { maximumFractionDigits: 2 })}`;
    }
    return exchangeRate
      ? `Bs. ${(Number(r.total_amount) * exchangeRate).toLocaleString("es-ES", { maximumFractionDigits: 2 })}`
      : `$${Number(r.total_amount).toLocaleString()}`;
  };

  const bsFormat = (amount: number) =>
    `Bs. ${amount.toLocaleString("es-ES", { maximumFractionDigits: 2 })}`;

  const [period, setPeriod] = useState<Period>("all");

  const completed = useMemo(() =>
    (reservations || []).filter((r: Reservation) => r.reservation_status === "completed"),
    [reservations]
  );

  const pending = useMemo(() =>
    (reservations || []).filter((r: Reservation) => r.reservation_status === "pending" || r.reservation_status === "confirmed"),
    [reservations]
  );

  const now = new Date();
  const filteredCompleted = useMemo(() => {
    if (period === "all") return completed;
    const cutoff = new Date(now);
    if (period === "month") cutoff.setMonth(cutoff.getMonth() - 1);
    else if (period === "quarter") cutoff.setMonth(cutoff.getMonth() - 3);
    else if (period === "year") cutoff.setFullYear(cutoff.getFullYear() - 1);
    return completed.filter((r: Reservation) => new Date(r.check_out_date) >= cutoff);
  }, [completed, period, now]);

  const totalRevenue = filteredCompleted.reduce((s: number, r: Reservation) => s + (r.total_amount_bs ? Number(r.total_amount_bs) : Number(r.total_amount) * (exchangeRate || 1)), 0);
  const avgRevenue = filteredCompleted.length > 0 ? Math.round(totalRevenue / filteredCompleted.length) : 0;
  const pendingRevenue = pending.reduce((s: number, r: Reservation) => s + Number(r.total_amount || 0), 0);
  const totalRooms = rooms?.length || 0;
  const revenuePerRoom = totalRooms > 0 ? Math.round(totalRevenue / totalRooms) : 0;
  const activeOccupancies = occupancies?.filter((o) => o.occupancy_status === "active").length || 0;
  const servicesCount = services?.length || 0;

  const monthlyRevenue = useMemo(() => {
    const months: { label: string; revenue: number; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString("es-ES", { month: "short" });
      const matched = completed.filter((r: Reservation) => {
        const co = new Date(r.check_out_date);
        return co.getMonth() === d.getMonth() && co.getFullYear() === d.getFullYear();
      });
      const rev = matched.reduce((s: number, r: Reservation) => s + (r.total_amount_bs ? Number(r.total_amount_bs) : Number(r.total_amount) * (exchangeRate || 1)), 0);
      const cnt = matched.length;
      months.push({ label, revenue: rev, count: cnt });
    }
    return months;
  }, [completed, now]);

  const revenueByType = useMemo(() => {
    const map: Record<string, number> = {};
    rooms?.forEach((r: Room) => {
      if (!map[r.room_type]) map[r.room_type] = 0;
    });
    completed.forEach((r: Reservation) => {
      const room = rooms?.find((rm) => rm.id_room === r.id_room);
      if (room) {
        const revBs = r.total_amount_bs ? Number(r.total_amount_bs) : Number(r.total_amount) * (exchangeRate || 1);
        map[room.room_type] = (map[room.room_type] || 0) + revBs;
      }
    });
    return Object.entries(map).map(([type, rev]) => ({
      label: type.charAt(0).toUpperCase() + type.slice(1),
      revenue: rev,
    }));
  }, [completed, rooms]);

  const chartConfig = {
    backgroundColor: "transparent",
    backgroundGradientFrom: resolvedTheme === "dark" ? "#1f2937" : "#f8fafc",
    backgroundGradientTo: resolvedTheme === "dark" ? "#111827" : "#f1f5f9",
    decimalCount: 0,
    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
    labelColor: (opacity = 1) => resolvedTheme === "dark" ? `rgba(255, 255, 255, ${opacity * 0.7})` : `rgba(51, 65, 85, ${opacity * 0.7})`,
    barPercentage: 0.6,
    propsForLabels: { fontSize: 11 },
  };

  const periods = [
    { key: "all" as Period, label: "Todo el tiempo" },
    { key: "year" as Period, label: "Este año" },
    { key: "quarter" as Period, label: "Trimestre" },
    { key: "month" as Period, label: "Mes" },
  ];

  async function downloadPDF() {
    const pdfMaxMonthly = Math.max(...monthlyRevenue.map((m) => m.revenue), 1);
    const pdfMaxByType = Math.max(...revenueByType.map((t) => t.revenue), 1);
    const html = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: -apple-system, Helvetica, Arial, sans-serif; padding: 24px; color: #1f2937; }
            h1 { font-size: 24px; margin-bottom: 4px; color: #111827; }
            .date { font-size: 12px; color: #6b7280; margin-bottom: 24px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
            th { background: #f3f4f6; text-align: left; padding: 8px 10px; font-size: 11px; color: #374151; text-transform: uppercase; letter-spacing: 0.5px; }
            td { padding: 8px 10px; border-bottom: 1px solid #e5e7eb; }
            .stat-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
            .stat-label { color: #6b7280; }
            .stat-value { font-weight: 600; }
            .section-title { font-weight: 600; margin-top: 20px; margin-bottom: 8px; font-size: 14px; color: #111827; }
            .amount { text-align: right; font-weight: 600; }
            .h-bar-row { display: flex; align-items: center; gap: 8px; padding: 5px 0; border-bottom: 1px solid #f3f4f6; }
            .h-bar-label { width: 55px; font-size: 11px; color: #374151; font-weight: 500; }
            .h-bar-track { flex: 1; height: 18px; background: #f3f4f6; border-radius: 4px; overflow: hidden; }
            .h-bar-fill { height: 100%; border-radius: 4px; min-width: 4px; }
            .h-bar-amount { width: 80px; text-align: right; font-size: 11px; font-weight: 600; color: #059669; }
            .footer { margin-top: 32px; font-size: 11px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 16px; }
          </style>
        </head>
        <body>
          <h1>Reporte de Contabilidad</h1>
          <div class="date">Período: ${periods.find((p) => p.key === period)?.label} — Generado: ${now.toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}</div>

          <div class="section-title">Resumen Financiero</div>
          <div class="stat-row"><span class="stat-label">Ingresos Totales</span><span class="stat-value">${bsFormat(totalRevenue)}</span></div>
          <div class="stat-row"><span class="stat-label">Transacciones Completadas</span><span class="stat-value">${filteredCompleted.length}</span></div>
          <div class="stat-row"><span class="stat-label">Promedio por Reserva</span><span class="stat-value">${bsFormat(avgRevenue)}</span></div>
          <div class="stat-row"><span class="stat-label">Ingresos Pendientes</span><span class="stat-value">${toBs(pendingRevenue)}</span></div>
          <div class="stat-row"><span class="stat-label">Ingresos por Habitación</span><span class="stat-value">${bsFormat(revenuePerRoom)}</span></div>
          <div class="stat-row"><span class="stat-label">Ocupaciones Activas</span><span class="stat-value">${activeOccupancies}</span></div>
          <div class="stat-row"><span class="stat-label">Servicios Disponibles</span><span class="stat-value">${servicesCount}</span></div>

          <div class="section-title">Ingresos Mensuales (Últimos 6 Meses)</div>
          ${monthlyRevenue.map((m) =>
            `<div class="h-bar-row">
              <span class="h-bar-label">${m.label}</span>
              <div class="h-bar-track"><div class="h-bar-fill" style="width:${(m.revenue / pdfMaxMonthly) * 100}%;background:#10B981"></div></div>
              <span class="h-bar-amount">${bsFormat(m.revenue)}</span>
            </div>`
          ).join("")}

          <div class="section-title">Ingresos por Tipo de Habitación</div>
          ${revenueByType.map((t) =>
            `<div class="h-bar-row">
              <span class="h-bar-label">${t.label}</span>
              <div class="h-bar-track"><div class="h-bar-fill" style="width:${(t.revenue / pdfMaxByType) * 100}%;background:#8B5CF6"></div></div>
              <span class="h-bar-amount">${bsFormat(t.revenue)}</span>
            </div>`
          ).join("")}

          <div class="section-title">Transacciones (${filteredCompleted.length})</div>
          <table>
            <tr><th>Fecha</th><th>Cliente</th><th>Habitación</th><th class="amount">Monto</th></tr>
            ${filteredCompleted
              .sort((a: Reservation, b: Reservation) => new Date(b.check_out_date).getTime() - new Date(a.check_out_date).getTime())
              .map((r: Reservation) =>
                `<tr>
                  <td>${new Date(r.check_out_date).toLocaleDateString()}</td>
                  <td>${r.client?.full_name || "—"}</td>
                  <td>${r.room?.room_number || "—"}</td>
                  <td class="amount">${formatReservation(r)}</td>
                </tr>`
              )
              .join("")}
          </table>

          <div class="footer">Sistema de Gestión Hotelera — Reporte de Contabilidad</div>
        </body>
      </html>`;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: "Guardar Reporte de Contabilidad" });
      }
    } catch (err) {
      console.warn("PDF generation failed:", err);
    }
  }

  const hasMonthlyData = monthlyRevenue.some((m) => m.revenue > 0);

  return (
    <ScrollView className="flex-1">
      <ThemedView className="px-5 pt-4 pb-8">
        <View className="flex-row items-center justify-between mb-1">
          <ThemedText type="title" className="text-2xl">Contabilidad</ThemedText>
          <TouchableOpacity onPress={downloadPDF} className="flex-row items-center px-4 py-2.5 rounded-lg bg-emerald-500/15">
            <MaterialIcons name="file-download" size={20} color="#10B981" />
            <ThemedText className="ml-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">PDF</ThemedText>
          </TouchableOpacity>
        </View>
        <ThemedText className="opacity-60 mb-5 text-sm">Resumen financiero e historial de transacciones</ThemedText>

        {/* Period filter */}
        <ThemedView className="flex-row bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-5">
          {periods.map((p) => (
            <TouchableOpacity
              key={p.key}
              className={`flex-1 py-2.5 rounded-lg items-center ${period === p.key ? "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600" : ""}`}
              onPress={() => setPeriod(p.key)}
            >
              <ThemedText className={`text-sm font-semibold ${period === p.key ? "text-[#0EA5E9]" : "opacity-60"}`}>{p.label}</ThemedText>
            </TouchableOpacity>
          ))}
        </ThemedView>

        {/* KPI cards — 3 per row */}
        <View className="flex-row flex-wrap gap-3 mb-5">
          <KpiCard icon="attach-money" label="Ingresos Totales" value={bsFormat(totalRevenue)} color="#10B981" />
          <KpiCard icon="receipt" label="Transacciones" value={filteredCompleted.length} color="#0EA5E9" />
          <KpiCard icon="trending-up" label="Promedio/Reserva" value={bsFormat(avgRevenue)} color="#8B5CF6" />
          <KpiCard icon="pending" label="Pendiente" value={toBs(pendingRevenue)} color="#F59E0B" />
          <KpiCard icon="hotel" label="Ingreso/Habitación" value={bsFormat(revenuePerRoom)} color="#EC4899" />
          <KpiCard icon="meeting-room" label="Estancias Activas" value={activeOccupancies} color="#3B82F6" />
        </View>

        {/* Monthly Revenue Chart */}
        <ThemedView className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-300 shadow-sm p-5 mb-5">
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 rounded-xl bg-emerald-500/10 items-center justify-center mr-3">
              <MaterialIcons name="bar-chart" size={22} color="#10B981" />
            </View>
            <View className="flex-1">
              <ThemedText type="subtitle" className="text-base">Ingresos Mensuales</ThemedText>
              <ThemedText className="text-xs opacity-60">Últimos 6 meses</ThemedText>
            </View>
            <View className="px-2 py-1 rounded-lg bg-emerald-500/10">
              <ThemedText className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Bs.</ThemedText>
            </View>
          </View>

          {hasMonthlyData ? (
            <View className="items-center">
              <BarChart
                data={{
                  labels: monthlyRevenue.map((m) => m.label),
                  datasets: [{ data: monthlyRevenue.map((m) => Math.round((m.revenue || 0) / 1000)) }],
                }}
                width={screenWidth - 40}
                height={220}
                chartConfig={chartConfig}
                yAxisLabel=""
                yAxisSuffix="k"
                fromZero
                showValuesOnTopOfBars
                withInnerLines={false}
                style={{ borderRadius: 12 }}
              />
              <ThemedText className="text-[10px] opacity-40 mt-1">* Valores en miles de Bs.</ThemedText>
            </View>
          ) : (
            <View className="py-10 items-center">
              <MaterialIcons name="bar-chart" size={36} color="#CBD5E1" />
              <ThemedText className="mt-3 text-sm opacity-60">Sin datos de ingresos aún</ThemedText>
            </View>
          )}
        </ThemedView>

        {/* Revenue by Room Type Chart */}
        <ThemedView className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-300 shadow-sm p-5 mb-5">
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 rounded-xl bg-purple-500/10 items-center justify-center mr-3">
              <MaterialIcons name="layers" size={22} color="#8B5CF6" />
            </View>
            <View className="flex-1">
              <ThemedText type="subtitle" className="text-base">Ingresos por Tipo de Habitación</ThemedText>
              <ThemedText className="text-xs opacity-60">Desglose por categorías</ThemedText>
            </View>
            <View className="px-2 py-1 rounded-lg bg-purple-500/10">
              <ThemedText className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">Bs.</ThemedText>
            </View>
          </View>

          {revenueByType.some((t) => t.revenue > 0) ? (
            <ThemedView className="items-center">
              <BarChart
                data={{
                  labels: revenueByType.map((t) => t.label),
                  datasets: [{ data: revenueByType.map((t) => Math.round((t.revenue || 0) / 1000)) }],
                }}
                width={screenWidth - 40}
                height={220}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
                }}
                yAxisLabel=""
                yAxisSuffix="k"
                fromZero
                showValuesOnTopOfBars
                withInnerLines={false}
                style={{ borderRadius: 12 }}
              />
              <ThemedText className="text-[10px] opacity-40 mt-1">* Valores en miles de Bs.</ThemedText>
            </ThemedView>
          ) : (
            <View className="py-10 items-center">
              <MaterialIcons name="layers" size={36} color="#CBD5E1" />
              <ThemedText className="mt-3 text-sm opacity-60">Sin ingresos por tipo aún</ThemedText>
            </View>
          )}
        </ThemedView>

        {/* Transaction table */}
        <ThemedView className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-300 shadow-sm p-5 mb-5">
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 rounded-xl bg-emerald-500/10 items-center justify-center mr-3">
              <MaterialIcons name="receipt-long" size={22} color="#10B981" />
            </View>
            <View className="flex-1">
              <ThemedText type="subtitle" className="text-base">Transacciones</ThemedText>
              <ThemedText className="text-xs opacity-60">{filteredCompleted.length} completadas · {bsFormat(totalRevenue)} total</ThemedText>
            </View>
          </View>

          <ThemedView className="flex-row items-center py-3 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 mb-1">
            <ThemedText className="flex-[2] text-xs font-semibold uppercase opacity-60">Fecha</ThemedText>
            <ThemedText className="flex-[2.5] text-xs font-semibold uppercase opacity-60">Cliente</ThemedText>
            <ThemedText className="flex-[1] text-xs font-semibold uppercase opacity-60">Hab.</ThemedText>
            <ThemedText className="flex-[1.5] text-xs font-semibold uppercase opacity-60 text-right">Monto</ThemedText>
          </ThemedView>

          {filteredCompleted.length === 0 ? (
            <View className="py-12 items-center">
              <MaterialIcons name="receipt-long" size={40} color="#CBD5E1" />
              <ThemedText className="mt-2 text-sm opacity-60">No hay transacciones completadas</ThemedText>
            </View>
          ) : (
            filteredCompleted
              .sort((a: Reservation, b: Reservation) => new Date(b.check_out_date).getTime() - new Date(a.check_out_date).getTime())
              .map((r: Reservation) => (
                <View key={r.id_reservation} className="flex-row items-center py-3 border-b border-gray-100 dark:border-gray-700 px-3">
                  <ThemedText className="flex-[2] text-sm opacity-70">
                    {new Date(r.check_out_date).toLocaleDateString()}
                  </ThemedText>
                  <View className="flex-[2.5]">
                    <ThemedText className="text-sm font-medium">{r.client?.full_name || "—"}</ThemedText>
                  </View>
                  <ThemedText className="flex-[1] text-sm">{r.room?.room_number || "—"}</ThemedText>
                  <ThemedText className="flex-[1.5] text-sm font-bold text-green-600 dark:text-green-400 text-right">
                    {formatReservation(r)}
                  </ThemedText>
                </View>
              ))
          )}

          {filteredCompleted.length > 0 && (
            <View className="flex-row items-center py-3 px-3 mt-2 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg">
              <ThemedText className="flex-[5.5] text-base font-bold">Total</ThemedText>
              <ThemedText className="flex-[1.5] text-base font-bold text-green-600 dark:text-green-400 text-right">
                {bsFormat(totalRevenue)}
              </ThemedText>
            </View>
          )}
        </ThemedView>

        {/* Pending revenue card */}
        {pending.length > 0 && (
          <ThemedView className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-300 shadow-sm p-5">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 rounded-xl bg-amber-500/10 items-center justify-center mr-3">
                <MaterialIcons name="pending" size={22} color="#F59E0B" />
              </View>
              <View className="flex-1">
                <ThemedText type="subtitle" className="text-base">Ingresos Pendientes</ThemedText>
                <ThemedText className="text-xs opacity-60">{pending.length} reservas aún no completadas</ThemedText>
              </View>
              <ThemedText className="text-xl font-bold text-amber-500">{toBs(pendingRevenue)}</ThemedText>
            </View>

            <ThemedView className="flex-row items-center py-3 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 mb-1">
              <ThemedText className="flex-[2] text-xs font-semibold uppercase opacity-60">Cliente</ThemedText>
              <ThemedText className="flex-[1.5] text-xs font-semibold uppercase opacity-60">Hab.</ThemedText>
              <ThemedText className="flex-[1.5] text-xs font-semibold uppercase opacity-60">Salida</ThemedText>
              <ThemedText className="flex-[1] text-xs font-semibold uppercase opacity-60 text-right">Monto</ThemedText>
            </ThemedView>
            {pending.map((r: Reservation) => (
              <View key={r.id_reservation} className="flex-row items-center py-3 border-b border-gray-100 dark:border-gray-700 px-3">
                <ThemedText className="flex-[2] text-sm">{r.client?.full_name || "—"}</ThemedText>
                <ThemedText className="flex-[1.5] text-sm">{r.room?.room_number || "—"}</ThemedText>
                <ThemedText className="flex-[1.5] text-xs opacity-70">{new Date(r.check_out_date).toLocaleDateString()}</ThemedText>
                <ThemedText className="flex-[1] text-sm font-bold text-amber-500 text-right">{toBs(r.total_amount)}</ThemedText>
              </View>
            ))}
          </ThemedView>
        )}
      </ThemedView>
    </ScrollView>
  );
}

function KpiCard({ icon, label, value, color }: { icon: string; label: string; value: string | number; color: string }) {
  return (
    <View className="w-[31%] bg-white dark:bg-gray-800 rounded-2xl p-4 items-center shadow-sm border border-gray-100 dark:border-gray-700">
      <View className="w-10 h-10 rounded-xl items-center justify-center mb-2" style={{ backgroundColor: `${color}15` }}>
        <MaterialIcons name={icon as any} size={22} color={color} />
      </View>
      <ThemedText className="text-lg font-bold" style={{ color }}>{value}</ThemedText>
      <ThemedText className="text-xs opacity-60 mt-0.5 text-center">{label}</ThemedText>
    </View>
  );
}
