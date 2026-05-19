import { FlatList, View, ActivityIndicator } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useRooms } from "@/hooks";
import { ClientRoomCard } from "@/components/client/ClientRoomCard";
import { EmptyState, StatBadge } from "@/components/shared";
import { MaterialIcons } from "@expo/vector-icons";
import { Room } from "@/hooks/api/types";

export default function RoomsScreen() {
  const { data: rooms, isLoading, error } = useRooms();

  if (isLoading) {
    return (
      <ThemedView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0EA5E9" />
        <ThemedText className="mt-4 opacity-60">Loading rooms...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView className="flex-1 justify-center items-center px-6">
        <MaterialIcons name="error-outline" size={48} color="#EF4444" />
        <ThemedText className="mt-4 text-center opacity-60">
          Failed to load rooms
        </ThemedText>
      </ThemedView>
    );
  }

  const availableCount = rooms?.filter((r) => r.room_status === "available").length || 0;

  return (
    <ThemedView className="flex-1">
      <ThemedView className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <View className="flex-row justify-between items-center">
          <View>
            <ThemedText type="title">Rooms</ThemedText>
            <ThemedText className="opacity-60 mt-0.5">
              {rooms?.length || 0} total
            </ThemedText>
          </View>
          <StatBadge label="Free" value={availableCount} color="#10B981" />
        </View>
      </ThemedView>

      <FlatList
        data={rooms || []}
        keyExtractor={(item) => item.id_room.toString()}
        renderItem={({ item }) => <ClientRoomCard item={item as Room} />}
        contentContainerClassName="px-4 py-4"
        ListEmptyComponent={!isLoading ? <EmptyState icon="hotel" title="No rooms found" /> : null}
      />
    </ThemedView>
  );
}
