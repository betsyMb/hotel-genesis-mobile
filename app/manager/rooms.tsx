import { FlatList, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import {useRooms, useExchangeRate, Room} from "@/hooks";
import { EmptyState, StatBadge } from "@/components/shared";

const statusLabels: Record<string, string> = {
  available: "Disponible",
  occupied: "Ocupado",
  maintenance: "Mantenimiento",
  reserved: "Reservado",
};

export default function ManagerRoomsScreen() {
  const { data: rooms, isLoading } = useRooms();
  const { data: exchangeRate } = useExchangeRate();

  const stats = {
    total: rooms?.length || 0,
    available: rooms?.filter((r) => r.room_status === "available").length || 0,
    occupied: rooms?.filter((r) => r.room_status === "occupied").length || 0,
    maintenance: rooms?.filter((r) => r.room_status === "maintenance").length || 0,
  };

  return (
    <ThemedView className="flex-1">
      <ThemedView className="px-5 py-3 border-b border-gray-100 dark:border-gray-800">
        <View className="flex-row gap-2 mb-3">
          <StatBadge label="Total" value={stats.total} color="#0EA5E9" />
          <StatBadge label="Libres" value={stats.available} color="#10B981" />
          <StatBadge label="Ocupadas" value={stats.occupied} color="#EF4444" />
          <StatBadge label="Mant." value={stats.maintenance} color="#F59E0B" />
        </View>
      </ThemedView>

      <FlatList
        data={rooms}
        keyExtractor={(item: Room) => item.id_room.toString()}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ThemedView className="rounded-2xl shadow-sm overflow-hidden mb-3 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
            <View className="p-4">
              <View className="flex-row justify-between items-start">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 rounded-xl bg-blue-400 items-center justify-center mr-3">
                    <ThemedText className="text-sm font-bold">{item.room_number}</ThemedText>
                  </View>
                  <View>
                    <ThemedText type="defaultSemiBold">Hab. {item.room_number}</ThemedText>
                    <ThemedText className="text-sm opacity-60">
                      {item.room_type.charAt(0).toUpperCase() + item.room_type.slice(1)} · Piso {item.floor}
                    </ThemedText>
                  </View>
                </View>
                <View className={`px-2.5 py-1 rounded-full ${item.room_status === "available" ? "bg-green-500/20" : item.room_status === "occupied" ? "bg-red-500/20" : "bg-amber-500/20"}`}>
                  <ThemedText className={`text-xs font-semibold ${item.room_status === "available" ? "text-green-600" : item.room_status === "occupied" ? "text-red-500" : "text-amber-600"}`}>
                    {statusLabels[item.room_status] || item.room_status}
                  </ThemedText>
                </View>
              </View>
              <View className="flex-row items-center mt-3 gap-4">
                <View>
                  <ThemedText className="text-xs opacity-60">Capacidad</ThemedText>
                  <ThemedText className="text-sm font-semibold">{item.capacity || "—"} huéspedes</ThemedText>
                </View>
                <View>
                  <ThemedText className="text-xs opacity-60">Precio</ThemedText>
                  <ThemedText className="text-sm font-semibold">{exchangeRate ? `Bs. ${(item.price_per_night * exchangeRate).toLocaleString("es-ES", { maximumFractionDigits: 0 })}` : `$${item.price_per_night}`}/noche</ThemedText>
                  <ThemedText className="text-xs font-semibold text-[#8B5CF6]">{exchangeRate ? `Bs. ${(item.price_per_3hours * exchangeRate).toLocaleString("es-ES", { maximumFractionDigits: 0 })}` : `$${item.price_per_3hours}`}/3h</ThemedText>
                </View>
              </View>
            </View>
          </ThemedView>
        )}
        contentContainerClassName="px-4 py-4"
        ListEmptyComponent={!isLoading ? <EmptyState icon="hotel" title="No se encontraron habitaciones" /> : null}
      />
    </ThemedView>
  );
}
