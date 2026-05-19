import { useState } from "react";
import { FlatList, TouchableOpacity, View, Alert } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { RoomCard, RoomFormModal, StatBadge, EmptyState } from "@/components/shared";
import { useRooms, useCreateRoom, useUpdateRoom, useDeleteRoom } from "@/hooks";
import { Room } from "@/hooks/api/types";
import { MaterialIcons } from "@expo/vector-icons";

export default function AdminRoomsScreen() {
  const { data: rooms, isLoading, refetch } = useRooms();
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();

  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  async function handleCreate(data: Partial<Room>) {
    try {
      await createRoom.mutateAsync(data as any);
      refetch();
      Alert.alert("Success", "Room created!");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  }

  async function handleUpdate(data: Partial<Room>) {
    if (!editingRoom) return;
    try {
      await updateRoom.mutateAsync({ id: editingRoom.id_room, data });
      refetch();
      setEditingRoom(null);
      Alert.alert("Success", "Room updated!");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  }

  function handleDelete(id: number) {
    Alert.alert("Delete Room", "Are you sure? This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteRoom.mutateAsync(id);
            refetch();
            Alert.alert("Deleted", "Room deleted successfully");
          } catch (err: any) {
            Alert.alert("Error", err.message);
          }
        },
      },
    ]);
  }

  const stats = {
    total: rooms?.length || 0,
    available: rooms?.filter((r) => r.room_status === "available").length || 0,
    occupied: rooms?.filter((r) => r.room_status === "occupied").length || 0,
    maintenance: rooms?.filter((r) => r.room_status === "maintenance").length || 0,
  };

  return (
    <ThemedView className="flex-1">
      <View className="px-5 py-3 border-b border-gray-100 dark:border-gray-800">
        <View className="flex-row gap-2 mb-3">
          <StatBadge label="Total" value={stats.total} color="#0EA5E9" />
          <StatBadge label="Free" value={stats.available} color="#10B981" />
          <StatBadge label="Used" value={stats.occupied} color="#EF4444" />
          <StatBadge label="Maint." value={stats.maintenance} color="#F59E0B" />
        </View>
      </View>

      <FlatList
        data={rooms || []}
        keyExtractor={(item) => item.id_room.toString()}
        renderItem={({ item }) => (
          <RoomCard item={item} onEdit={(r) => { setEditingRoom(r); setShowForm(true); }} onDelete={handleDelete} />
        )}
        contentContainerClassName="px-4 py-4"
        ListEmptyComponent={!isLoading ? <EmptyState icon="hotel" title="No rooms found" /> : null}
      />

      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-[#0EA5E9] items-center justify-center shadow-lg"
        onPress={() => { setEditingRoom(null); setShowForm(true); }}
      >
        <MaterialIcons name="add" size={28} color="white" />
      </TouchableOpacity>

      <RoomFormModal
        key={editingRoom?.id_room ?? "new"}
        visible={showForm}
        onClose={() => { setShowForm(false); setEditingRoom(null); }}
        onSubmit={editingRoom ? handleUpdate : handleCreate}
        editingRoom={editingRoom}
      />
    </ThemedView>
  );
}
