import { FlatList, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useRooms } from "@/hooks";
import { EmptyState, StatBadge, RoomCard } from "@/components/shared";

export default function ReceptionistRoomsScreen() {
  const { data: rooms, isLoading } = useRooms();

  const stats = {
    total: rooms?.length || 0,
    available: rooms?.filter((r) => r.room_status === "available").length || 0,
    occupied: rooms?.filter((r) => r.room_status === "occupied").length || 0,
  };

  return (
    <ThemedView className="flex-1">
      <View className="px-5 py-3 border-b border-gray-100 dark:border-gray-800">
        <View className="flex-row gap-2 mb-3">
          <StatBadge label="Total" value={stats.total} color="#0EA5E9" />
          <StatBadge label="Free" value={stats.available} color="#10B981" />
          <StatBadge label="Used" value={stats.occupied} color="#EF4444" />
        </View>
      </View>

      <FlatList
        data={rooms || []}
        keyExtractor={(item) => item.id_room.toString()}
        renderItem={({ item }) => <RoomCard item={item} />}
        contentContainerClassName="px-4 py-4"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={!isLoading ? <EmptyState icon="hotel" title="No rooms found" /> : null}
      />
    </ThemedView>
  );
}
