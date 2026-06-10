import { ScrollView, View, ActivityIndicator, TouchableOpacity, FlatList, RefreshControl } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useTheme } from "@/hooks/use-theme";
import { useAuth, useRooms, useReservations, useExchangeRate } from "@/hooks";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Reservation } from "@/hooks/api/types";

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: rooms, isLoading: roomsLoading } = useRooms();
  const { data: reservations } = useReservations();
  const { data: exchangeRate } = useExchangeRate();

  const availableRooms = rooms?.filter((r) => r.room_status === "available") || [];
  const myReservations = reservations?.filter(
    (r: Reservation) => r.id_client === user?.id_user
  ) || [];
  const activeReservations = myReservations.filter(
    (r: Reservation) => r.reservation_status === "pending" || r.reservation_status === "confirmed"
  );

  if (roomsLoading) {
    return (
      <ThemedView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0EA5E9" />
      </ThemedView>
    );
  }

  const backgroundColor = useThemeColor({}, "background");
  const { resolvedTheme } = useTheme();

  return (
    <ScrollView className="flex-1" style={{ backgroundColor }}>
      <View className="px-5 pt-6 pb-4">
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <ThemedText className="text-lg opacity-60">Bienvenido de nuevo</ThemedText>
            <ThemedText type="title">{user?.full_name?.split(" ")[0] || "Huésped"}</ThemedText>
          </View>
          <View className="w-12 h-12 rounded-full bg-[#0EA5E9]/10 items-center justify-center">
            <MaterialIcons name="person" size={24} color="#0EA5E9" />
          </View>
        </View>

        <View className="flex-row -mx-2 mb-6">
          <StatCard
            icon="hotel"
            label="Habitacion"
            value={availableRooms.length.toString()}
            color="#0EA5E9"
            bgColor="#0EA5E9/10"
          />
          <StatCard
            icon="event-note"
            label="Reservas"
            value={myReservations.length.toString()}
            color="#8B5CF6"
            bgColor="#8B5CF6/10"
          />
          <StatCard
            icon="check-circle"
            label="Activas"
            value={activeReservations.length.toString()}
            color="#10B981"
            bgColor="#10B981/10"
          />
        </View>

        <View className={`rounded-xl p-5 mb-6 ${resolvedTheme === "dark" ? "bg-indigo-900/60" : "bg-violet-200"}`}>
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <ThemedText className="text-white text-lg font-semibold mt-1">
                Reservar una Habitación
              </ThemedText>
            </View>
            <TouchableOpacity
              className="bg-white/20 px-5 py-2.5 rounded-full border border-white/30"
              onPress={() => router.push("/(tabs)/booking")}
            >
              <ThemedText className="text-white font-semibold text-sm">Reservar</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-row justify-between items-center mb-3">
          <ThemedText type="subtitle">Habitaciones Disponibles</ThemedText>
          <TouchableOpacity onPress={() => router.push("/(tabs)/rooms")}>
            <ThemedText className="text-[#0EA5E9] font-semibold text-sm">Ver Todas</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-5 pb-6">
        <FlatList
          data={availableRooms.slice(0, 5)}
          keyExtractor={(item) => item.id_room.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-3"
          renderItem={({ item }) => (
            <TouchableOpacity
              className="w-52 bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4"
              onPress={() => router.push("/(tabs)/booking")}
            >
              <View className="flex-row justify-between items-start mb-3">
                <View className="w-10 h-10 rounded-xl bg-[#0EA5E9]/10 items-center justify-center">
                  <MaterialIcons name="hotel" size={22} color="#0EA5E9" />
                </View>
                <View className="bg-green-500/10 px-2 py-0.5 rounded-full">
                  <ThemedText className="text-green-600 text-xs font-semibold">
                    Disponible
                  </ThemedText>
                </View>
              </View>
              <ThemedText className="text-sm opacity-60">
                {item.room_type.charAt(0).toUpperCase() + item.room_type.slice(1)}
              </ThemedText>
              <ThemedText className="text-lg font-bold text-[#0EA5E9] mt-1">
                {exchangeRate ? `Bs. ${(item.price_per_night * exchangeRate).toLocaleString("es-ES", { maximumFractionDigits: 2 })}` : `$${item.price_per_night}`}
                <ThemedText className="text-sm font-normal opacity-60"> Por noche</ThemedText>
              </ThemedText>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 items-center">
              <MaterialIcons name="hotel" size={32} color="#CBD5E1" />
              <ThemedText className="mt-2 opacity-60">No hay habitaciones disponibles</ThemedText>
            </View>
          }
        />
      </View>

      <View className="px-5 pb-8">
        <View className="flex-row justify-between items-center mb-3">
          <ThemedText type="subtitle">Reservas Recientes</ThemedText>
          <TouchableOpacity onPress={() => router.push("/(tabs)/booking")}>
            <ThemedText className="text-[#0EA5E9] font-semibold text-sm">Ver Todas</ThemedText>
          </TouchableOpacity>
        </View>

        {myReservations.slice(0, 3).map((r: Reservation) => {
          const statusColors: Record<string, string> = {
            pending: "#F59E0B",
            confirmed: "#10B981",
            cancelled: "#EF4444",
            completed: "#3B82F6",
            no_show: "#6B7280",
          };
          const color = statusColors[r.reservation_status] || "#6B7280";
          const checkIn = new Date(r.check_in_date).toLocaleDateString("es-ES", {
            month: "short",
            day: "numeric",
          });
          const checkOut = new Date(r.check_out_date).toLocaleDateString("es-ES", {
            month: "short",
            day: "numeric",
          });

          return (
            <TouchableOpacity
              key={r.id_reservation}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-3 flex-row items-center"
              onPress={() => router.push("/(tabs)/booking")}
            >
              <View className="w-10 h-10 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: `${color}15` }}>
                <MaterialIcons name="event-note" size={20} color={color} />
              </View>
              <View className="flex-1">
                <ThemedText className="font-semibold">
                  Hab. {r.room?.room_number || r.id_room}
                </ThemedText>
                <ThemedText className="text-xs opacity-60">
                  {checkIn} → {checkOut}
                </ThemedText>
              </View>
              <View className="items-end">
                <ThemedText className="text-sm font-bold text-[#0EA5E9]">
                  {(r.reservation_status === "completed" || r.reservation_status === "cancelled") && r.total_amount_bs ? `Bs. ${Number(r.total_amount_bs).toLocaleString("es-ES", { maximumFractionDigits: 2 })}` : exchangeRate ? `Bs. ${(r.total_amount * exchangeRate).toLocaleString("es-ES", { maximumFractionDigits: 2 })}` : `$${r.total_amount}`}
                </ThemedText>
                <ThemedText className="text-xs font-semibold" style={{ color }}>
                  {r.reservation_status === "pending" ? "Pendiente" : r.reservation_status === "confirmed" ? "Confirmada" : r.reservation_status === "completed" ? "Completada" : r.reservation_status === "cancelled" ? "Cancelada" : r.reservation_status === "no_show" ? "No Show" : r.reservation_status}
                </ThemedText>
              </View>
            </TouchableOpacity>
          );
        })}

        {myReservations.length === 0 && (
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 items-center">
            <MaterialIcons name="event-note" size={32} color="#CBD5E1" />
            <ThemedText className="mt-2 opacity-60">No hay reservas aún</ThemedText>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  bgColor,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
  bgColor: string;
}) {
  return (
    <View className="flex-1 mx-2">
      <View className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm border border-gray-100">
        <View className="w-8 h-8 rounded-lg items-center justify-center mb-2" style={{ backgroundColor: bgColor }}>
          <MaterialIcons name={icon as any} size={18} color={color} />
        </View>
        <ThemedText className="text-xl font-bold">{value}</ThemedText>
        <ThemedText className="text-xs opacity-60">{label}</ThemedText>
      </View>
    </View>
  );
}
