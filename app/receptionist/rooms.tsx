import { useState } from "react";
import { FlatList, RefreshControl, View, TouchableOpacity, Alert, TextInput } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useRooms, useExchangeRate, useUpdateRoom } from "@/hooks";
import { EmptyState, StatBadge, RoomCard } from "@/components/shared";
import { MaterialIcons } from "@expo/vector-icons";

const statusFilters = [
  { key: "all", label: "Todas", color: "#0EA5E9" },
  { key: "available", label: "Disponible", color: "#10B981" },
  { key: "occupied", label: "Ocupada", color: "#EF4444" },
  { key: "maintenance", label: "Mantenimiento", color: "#F59E0B" },
];

export default function ReceptionistRoomsScreen() {
  const { data: rooms, isLoading, refetch } = useRooms();
  const { data: exchangeRate } = useExchangeRate();
  const updateRoom = useUpdateRoom();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");
  const [maintenanceRoom, setMaintenanceRoom] = useState<any>(null);
  const [maintenanceNotes, setMaintenanceNotes] = useState("");
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);

  async function onRefresh() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  const filteredRooms = filter === "all"
    ? rooms || []
    : (rooms || []).filter((r) => r.room_status === filter);

  const stats = {
    total: rooms?.length || 0,
    available: rooms?.filter((r) => r.room_status === "available").length || 0,
    occupied: rooms?.filter((r) => r.room_status === "occupied").length || 0,
    maintenance: rooms?.filter((r) => r.room_status === "maintenance").length || 0,
  };

  function handleSendToMaintenance(room: any) {
    if (room.room_status === "occupied") {
      Alert.alert("No permitido", "No se puede enviar a mantenimiento una habitación ocupada");
      return;
    }
    setMaintenanceRoom(room);
    setMaintenanceNotes(room.maintenance_notes || "");
    setShowMaintenanceModal(true);
  }

  async function confirmMaintenance() {
    if (!maintenanceRoom) return;
    try {
      await updateRoom.mutateAsync({
        id: maintenanceRoom.id_room,
        data: {
          room_status: "maintenance" as any,
          maintenance_notes: maintenanceNotes.trim() || undefined,
        },
      });
      setShowMaintenanceModal(false);
      setMaintenanceRoom(null);
      setMaintenanceNotes("");
      refetch();
      Alert.alert("Éxito", `Habitación ${maintenanceRoom.room_number} enviada a mantenimiento`);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  }

  async function handleRestoreFromMaintenance(room: any) {
    Alert.alert(
      "Restaurar Habitación",
      `¿Restaurar la habitación ${room.room_number} a disponible?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Restaurar",
          onPress: async () => {
            try {
              await updateRoom.mutateAsync({
                id: room.id_room,
                data: {
                  room_status: "available" as any,
                  maintenance_notes: undefined,
                },
              });
              refetch();
              Alert.alert("Éxito", `Habitación ${room.room_number} restaurada`);
            } catch (err: any) {
              Alert.alert("Error", err.message);
            }
          },
        },
      ],
    );
  }

  return (
    <ThemedView className="flex-1">
      <View className="px-5 py-3 border-b border-gray-100 dark:border-gray-800">
        <View className="flex-row gap-2 mb-3">
          <StatBadge label="Total" value={stats.total} color="#0EA5E9" />
          <StatBadge label="Libre" value={stats.available} color="#10B981" />
          <StatBadge label="Ocupada" value={stats.occupied} color="#EF4444" />
          <StatBadge label="Mant." value={stats.maintenance} color="#F59E0B" />
        </View>
        <View className="flex-row bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {statusFilters.map((f) => (
            <TouchableOpacity
              key={f.key}
              className={`flex-1 py-2 rounded-lg items-center ${filter === f.key ? "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600" : ""}`}
              onPress={() => setFilter(f.key)}
            >
              <ThemedText className={`text-xs font-semibold ${filter === f.key ? "text-[#0EA5E9]" : "opacity-60"}`}>
                {f.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredRooms}
        keyExtractor={(item) => item.id_room.toString()}
        className="flex-1"
        renderItem={({ item }) => (
          <View>
            <RoomCard item={item} exchangeRate={exchangeRate} />
            {item.room_status !== "maintenance" && item.room_status !== "occupied" && (
              <TouchableOpacity
                className="flex-row items-center justify-center py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl mb-3 mx-1"
                onPress={() => handleSendToMaintenance(item)}
              >
                <MaterialIcons name="build" size={16} color="#F59E0B" style={{ marginRight: 4 }} />
                <ThemedText className="text-xs font-semibold text-amber-600">Enviar a Mantenimiento</ThemedText>
              </TouchableOpacity>
            )}
            {item.room_status === "maintenance" && (
              <TouchableOpacity
                className="flex-row items-center justify-center py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl mb-3 mx-1"
                onPress={() => handleRestoreFromMaintenance(item)}
              >
                <MaterialIcons name="check-circle" size={16} color="#10B981" style={{ marginRight: 4 }} />
                <ThemedText className="text-xs font-semibold text-green-600">Restaurar a Disponible</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        )}
        contentContainerClassName="px-4 py-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#0EA5E9"]} tintColor="#0EA5E9" />
        }
        ListEmptyComponent={!isLoading ? <EmptyState icon="hotel" title="No hay habitaciones" /> : null}
      />

      {showMaintenanceModal && (
        <View className="absolute inset-0 z-50 justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <TouchableOpacity className="absolute inset-0" activeOpacity={1} onPress={() => { setShowMaintenanceModal(false); setMaintenanceRoom(null); }} />
          <View className="mx-6 bg-white dark:bg-gray-800 rounded-2xl p-6">
            <ThemedText type="title" className="mb-1">Enviar a Mantenimiento</ThemedText>
            <ThemedText className="text-sm opacity-60 mb-4">
              Habitación {maintenanceRoom?.room_number} ({maintenanceRoom?.room_type})
            </ThemedText>
            <ThemedText className="font-semibold text-sm opacity-60 mb-1.5">Notas (opcional)</ThemedText>
            <TextInput
              className="text-sm dark:text-white py-3 px-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl mb-4"
              value={maintenanceNotes}
              onChangeText={setMaintenanceNotes}
              placeholder="Describa el problema..."
              placeholderTextColor="#94A3B8"
              multiline
              textAlignVertical="top"
              style={{ minHeight: 80 }}
            />
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 py-3 rounded-xl items-center bg-gray-100 dark:bg-gray-700"
                onPress={() => { setShowMaintenanceModal(false); setMaintenanceRoom(null); }}
              >
                <ThemedText className="font-semibold opacity-60">Cancelar</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3 rounded-xl items-center bg-amber-500"
                onPress={confirmMaintenance}
              >
                <ThemedText className="text-white font-semibold">Enviar</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ThemedView>
  );
}
