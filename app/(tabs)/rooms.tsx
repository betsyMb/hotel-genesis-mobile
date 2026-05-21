import { useState } from "react";
import { FlatList, View, ActivityIndicator, TouchableOpacity, ScrollView } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useRooms } from "@/hooks";
import { ClientRoomCard } from "@/components/client/ClientRoomCard";
import { EmptyState, StatBadge } from "@/components/shared";
import { MaterialIcons } from "@expo/vector-icons";
import { Room } from "@/hooks/api/types";
import { useRouter } from "expo-router";

export default function RoomsScreen() {
  const { data: rooms, isLoading, error } = useRooms();
  const router = useRouter();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

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

  const statusColors: Record<string, string> = {
    available: "#10B981",
    occupied: "#EF4444",
    maintenance: "#F59E0B",
    reserved: "#8B5CF6",
  };

  const statusIcons: Record<string, string> = {
    available: "check-circle",
    occupied: "block",
    maintenance: "build",
    reserved: "event-busy",
  };

  return (
    <ThemedView className="flex-1">
      <ThemedView className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <ThemedText type="title" className="mb-3">Rooms</ThemedText>
        <View className="flex-row gap-2">
          <StatBadge label="Total" value={rooms?.length || 0} color="#0EA5E9" />
          <StatBadge label="Free" value={availableCount} color="#10B981" />
        </View>
      </ThemedView>

      <FlatList
        data={rooms || []}
        keyExtractor={(item) => item.id_room.toString()}
        renderItem={({ item }) => (
          <ClientRoomCard item={item as Room} onPress={() => setSelectedRoom(item as Room)} />
        )}
        contentContainerClassName="px-4 py-4"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={!isLoading ? <EmptyState icon="hotel" title="No rooms found" /> : null}
      />

      {/* Room Detail Overlay */}
      {selectedRoom && (
        <View className="absolute inset-0 z-50">
          <View className="flex-1 bg-black/50" />
          <View className="absolute inset-0 flex-1 justify-end">
            <View className="bg-white dark:bg-gray-900 rounded-t-3xl max-h-[80%]">
              <View className="px-6 pt-6 pb-4">
                <View className="flex-row justify-between items-start mb-5">
                  <View className="flex-row items-center">
                    <View className="w-14 h-14 rounded-2xl bg-[#0EA5E9]/10 items-center justify-center mr-3">
                      <MaterialIcons name="meeting-room" size={28} color="#0EA5E9" />
                    </View>
                    <View>
                      <ThemedText type="title">Room {selectedRoom.room_number}</ThemedText>
                      <View className="flex-row items-center gap-1 mt-0.5">
                        <ThemedText className="opacity-60 capitalize">{selectedRoom.room_type}</ThemedText>
                        <View className="w-1 h-1 rounded-full bg-gray-300" />
                        <ThemedText className="opacity-60">Floor {selectedRoom.floor}</ThemedText>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedRoom(null)} className="p-1">
                    <MaterialIcons name="close" size={24} color="#64748B" />
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView className="px-6" showsVerticalScrollIndicator={false}>
                <View className="flex-row gap-3 mb-5">
                  <View className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl p-3 items-center">
                    <MaterialIcons name="attach-money" size={22} color="#0EA5E9" />
                    <ThemedText className="text-lg font-bold text-[#0EA5E9] mt-1">${selectedRoom.price_per_night}</ThemedText>
                    <ThemedText className="text-xs opacity-60">Per Night</ThemedText>
                  </View>
                  <View className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl p-3 items-center">
                    <MaterialIcons name="people" size={22} color="#8B5CF6" />
                    <ThemedText className="text-lg font-bold text-[#8B5CF6] mt-1">{selectedRoom.capacity || "—"}</ThemedText>
                    <ThemedText className="text-xs opacity-60">Guests</ThemedText>
                  </View>
                  <View className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl p-3 items-center">
                    <MaterialIcons name="floor" size={22} color="#F59E0B" />
                    <ThemedText className="text-lg font-bold text-[#F59E0B] mt-1">{selectedRoom.floor}</ThemedText>
                    <ThemedText className="text-xs opacity-60">Floor</ThemedText>
                  </View>
                </View>

                <View className="mb-5">
                  <ThemedText type="defaultSemiBold" className="mb-2">Status</ThemedText>
                  <View className="flex-row items-center gap-2 px-4 py-3 rounded-xl" style={{ backgroundColor: (statusColors[selectedRoom.room_status] || "#6B7280") + "15" }}>
                    <MaterialIcons name={statusIcons[selectedRoom.room_status] as any} size={20} color={statusColors[selectedRoom.room_status] || "#6B7280"} />
                    <View>
                      <ThemedText className="font-semibold capitalize">{selectedRoom.room_status}</ThemedText>
                      <ThemedText className="text-xs opacity-60">
                        {selectedRoom.room_status === "available" ? "This room is ready for booking" :
                         selectedRoom.room_status === "occupied" ? "Currently occupied by guests" :
                         selectedRoom.room_status === "maintenance" ? "Under maintenance" :
                         "Currently reserved"}
                      </ThemedText>
                    </View>
                  </View>
                </View>

                {selectedRoom.description && (
                  <View className="mb-5">
                    <ThemedText type="defaultSemiBold" className="mb-2">Description</ThemedText>
                    <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                      <ThemedText className="opacity-60 italic">{selectedRoom.description}</ThemedText>
                    </View>
                  </View>
                )}

                <View className="pb-6">
                  <TouchableOpacity
                    className={`py-4 rounded-xl items-center ${selectedRoom.room_status === "available" ? "bg-[#0EA5E9]" : "bg-gray-300 dark:bg-gray-700"}`}
                    onPress={() => {
                      if (selectedRoom.room_status === "available") {
                        setSelectedRoom(null);
                        router.push("/(tabs)/booking");
                      }
                    }}
                    disabled={selectedRoom.room_status !== "available"}
                  >
                    <View className="flex-row items-center gap-2">
                      <MaterialIcons name="calendar-today" size={20} color="white" />
                      <ThemedText className="text-white font-semibold text-base">
                        {selectedRoom.room_status === "available" ? "Book Now" : "Not Available"}
                      </ThemedText>
                    </View>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </View>
      )}
    </ThemedView>
  );
}
