import { ScrollView, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useRooms, useReservations, useUsers, useOccupancies } from "@/hooks";
import { MaterialIcons } from "@expo/vector-icons";
import { Reservation } from "@/hooks/api/types";

export default function AdminReportsScreen() {
  const { data: rooms } = useRooms();
  const { data: reservations } = useReservations();
  const { data: users } = useUsers();
  const { data: occupancies } = useOccupancies();

  const totalRooms = rooms?.length || 0;
  const availableRooms = rooms?.filter((r) => r.room_status === "available").length || 0;
  const occupancyRate = totalRooms > 0 ? Math.round(((totalRooms - availableRooms) / totalRooms) * 100) : 0;

  const totalReservations = reservations?.length || 0;
  const pendingReservations = reservations?.filter((r: Reservation) => r.reservation_status === "pending").length || 0;
  const confirmedReservations = reservations?.filter((r: Reservation) => r.reservation_status === "confirmed").length || 0;
  const completedReservations = reservations?.filter((r: Reservation) => r.reservation_status === "completed").length || 0;
  const cancelledReservations = reservations?.filter((r: Reservation) => r.reservation_status === "cancelled").length || 0;

  const totalRevenue = reservations
    ?.filter((r: Reservation) => r.reservation_status === "completed")
    .reduce((sum: number, r: Reservation) => sum + r.total_amount, 0) || 0;

  const totalUsers = users?.length || 0;
  const activeUsers = users?.filter((u) => u.is_active !== false).length || 0;
  const totalClients = users?.filter((u) => u.role === "Client").length || 0;

  const activeOccupancies = occupancies?.filter((o) => o.occupancy_status === "active").length || 0;

  return (
    <ScrollView className="flex-1">
      <ThemedView className="px-5 pt-4 pb-8">
        <ThemedText type="title" className="mb-1">Reports</ThemedText>
        <ThemedText className="opacity-60 mb-6">Dashboard overview</ThemedText>

        <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 mb-5">
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 rounded-xl bg-[#0EA5E9]/10 items-center justify-center mr-3">
              <MaterialIcons name="assessment" size={22} color="#0EA5E9" />
            </View>
            <ThemedText type="subtitle">Overview</ThemedText>
          </View>

          <View className="flex-row gap-3">
            <ReportCard icon="hotel" label="Rooms" value={totalRooms} color="#0EA5E9" />
            <ReportCard icon="event-note" label="Reservations" value={totalReservations} color="#8B5CF6" />
            <ReportCard icon="people" label="Users" value={totalUsers} color="#10B981" />
          </View>
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 mb-5">
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 rounded-xl bg-green-500/10 items-center justify-center mr-3">
              <MaterialIcons name="pie-chart" size={22} color="#10B981" />
            </View>
            <ThemedText type="subtitle">Rooms Status</ThemedText>
          </View>

          <View className="mb-3">
            <View className="flex-row justify-between items-center mb-2">
              <ThemedText className="text-sm opacity-70">Occupancy Rate</ThemedText>
              <ThemedText className="text-lg font-bold text-[#0EA5E9]">{occupancyRate}%</ThemedText>
            </View>
            <View className="w-full h-3 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
              <View className="h-full rounded-full bg-[#0EA5E9]" style={{ width: `${occupancyRate}%` }} />
            </View>
          </View>

          <View className="flex-row flex-wrap gap-2 mt-3">
            <StatusPill label="Available" value={availableRooms} color="#10B981" />
            <StatusPill label="Occupied" value={totalRooms - availableRooms - (rooms?.filter((r) => r.room_status === "maintenance").length || 0)} color="#EF4444" />
            <StatusPill label="Maintenance" value={rooms?.filter((r) => r.room_status === "maintenance").length || 0} color="#F59E0B" />
            <StatusPill label="Active Stays" value={activeOccupancies} color="#3B82F6" />
          </View>
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 mb-5">
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 rounded-xl bg-purple-500/10 items-center justify-center mr-3">
              <MaterialIcons name="attach-money" size={22} color="#8B5CF6" />
            </View>
            <ThemedText type="subtitle">Reservations</ThemedText>
          </View>

          <View className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 mb-4">
            <ThemedText className="text-sm opacity-70">Total Revenue (Completed)</ThemedText>
            <ThemedText className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
              ${totalRevenue.toLocaleString()}
            </ThemedText>
          </View>

          <View className="flex-row flex-wrap gap-2">
            <StatusPill label="Pending" value={pendingReservations} color="#F59E0B" />
            <StatusPill label="Confirmed" value={confirmedReservations} color="#10B981" />
            <StatusPill label="Completed" value={completedReservations} color="#3B82F6" />
            <StatusPill label="Cancelled" value={cancelledReservations} color="#6B7280" />
          </View>
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5">
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 rounded-xl bg-blue-500/10 items-center justify-center mr-3">
              <MaterialIcons name="group" size={22} color="#3B82F6" />
            </View>
            <ThemedText type="subtitle">Users</ThemedText>
          </View>

          <View className="flex-row gap-3 mb-4">
            <ReportCard icon="check-circle" label="Active" value={activeUsers} color="#10B981" />
            <ReportCard icon="person" label="Clients" value={totalClients} color="#0EA5E9" />
          </View>

          <View className="border-t border-gray-100 dark:border-gray-700 pt-3">
            {["Administrator", "Manager", "Receptionist", "Client", "Maintenance"].map((role) => {
              const count = users?.filter((u) => u.role === role).length || 0;
              const icons: Record<string, string> = {
                Administrator: "admin-panel-settings",
                Manager: "work",
                Receptionist: "reorder",
                Client: "person",
                Maintenance: "build",
              };
              const colors: Record<string, string> = {
                Administrator: "#EF4444",
                Manager: "#F59E0B",
                Receptionist: "#3B82F6",
                Client: "#10B981",
                Maintenance: "#6B7280",
              };

              return (
                <View key={role} className="flex-row justify-between items-center py-2">
                  <View className="flex-row items-center">
                    <MaterialIcons name={icons[role] as any} size={18} color={colors[role]} />
                    <ThemedText className="ml-2 text-sm">{role}</ThemedText>
                  </View>
                  <ThemedText className="text-sm font-semibold">{count}</ThemedText>
                </View>
              );
            })}
          </View>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

function ReportCard({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) {
  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 items-center">
      <MaterialIcons name={icon as any} size={20} color={color} />
      <ThemedText className="text-lg font-bold mt-1" style={{ color }}>{value}</ThemedText>
      <ThemedText className="text-xs opacity-60">{label}</ThemedText>
    </View>
  );
}

function StatusPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View className="flex-row items-center px-3 py-2 rounded-lg" style={{ backgroundColor: `${color}15` }}>
      <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: color }} />
      <ThemedText className="text-sm opacity-70">{label}:</ThemedText>
      <ThemedText className="ml-1 text-sm font-bold" style={{ color }}>{value}</ThemedText>
    </View>
  );
}
