import { useState } from "react";
import { FlatList, TouchableOpacity, View, Alert } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useRooms, useUpdateRoom } from "@/hooks";
import { Room, MaintenanceTask } from "@/hooks/api/types";
import { EmptyState, StatBadge } from "@/components/shared";
import { MaintenanceRoomCard } from "@/components/maintinence";

export default function MaintenanceTasksScreen() {
  const { data: rooms, isLoading, refetch } = useRooms();
  const updateRoom = useUpdateRoom();
  const [filter, setFilter] = useState<"all" | "maintenance">("all");

  async function handleMarkMaintenance(room: Room, tasks: MaintenanceTask[]) {
    try {
      await updateRoom.mutateAsync({
        id: room.id_room,
        data: {
          room_status: "maintenance" as any,
          maintenance_tasks: tasks,
        },
      });
      await refetch();
      Alert.alert("Success", `Room ${room.room_number} is now in maintenance`);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  }

  async function handleMarkAvailable(room: Room, tasks: MaintenanceTask[]) {
    try {
      await updateRoom.mutateAsync({
        id: room.id_room,
        data: {
          room_status: "available" as any,
          maintenance_tasks: tasks,
        },
      });
      await refetch();
      Alert.alert("Success", `Room ${room.room_number} is now available`);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  }

  const filteredRooms = rooms?.filter((r) =>
    filter === "all" || r.room_status === "maintenance"
  ) || [];

  const maintenanceCount = rooms?.filter((r) => r.room_status === "maintenance").length || 0;

  return (
    <ThemedView className="flex-1">
      <View className="px-5 py-3 border-b border-gray-100 dark:border-gray-800">
        <View className="flex-row gap-2 mb-3">
          <StatBadge label="Total" value={rooms?.length || 0} color="#0EA5E9" />
          <StatBadge label="In Maint." value={maintenanceCount} color="#F59E0B" />
          <StatBadge label="Available" value={rooms?.filter((r) => r.room_status === "available").length || 0} color="#10B981" />
        </View>

        <View className="flex-row bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          <TouchableOpacity
            className={`flex-1 py-2 rounded-lg items-center ${filter === "all" ? "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600" : ""}`}
            onPress={() => setFilter("all")}
          >
            <ThemedText className={`text-sm font-semibold ${filter === "all" ? "text-[#0EA5E9]" : "opacity-60"}`}>All</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-2 rounded-lg items-center ${filter === "maintenance" ? "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600" : ""}`}
            onPress={() => setFilter("maintenance")}
          >
            <ThemedText className={`text-sm font-semibold ${filter === "maintenance" ? "text-[#0EA5E9]" : "opacity-60"}`}>Maintenance ({maintenanceCount})</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredRooms}
        keyExtractor={(item: Room) => item.id_room.toString()}
        className="flex-1"
        renderItem={({ item }) => (
          <MaintenanceRoomCard
            item={item}
            onMarkMaintenance={handleMarkMaintenance}
            onMarkAvailable={handleMarkAvailable}
          />
        )}
        contentContainerClassName="px-4 py-4"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState icon="check-circle" title="No rooms in maintenance" />
          ) : null
        }
      />
    </ThemedView>
  );
}
