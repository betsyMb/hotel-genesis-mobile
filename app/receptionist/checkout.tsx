import { useState } from "react";
import { FlatList, TouchableOpacity, View, Alert } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useOccupancies, useUpdateOccupancy, useUpdateRoom } from "@/hooks";
import { Occupancy } from "@/hooks/api/types";
import { EmptyState, StatBadge } from "@/components/shared";
import { CheckInOutModals, OccupancyCard } from "@/components/receptionist";
import { MaterialIcons } from "@expo/vector-icons";

export default function ReceptionistCheckoutScreen() {
  const { data: occupancies, isLoading, refetch: refetchOccupancies } = useOccupancies();
  const updateOccupancy = useUpdateOccupancy();
  const updateRoom = useUpdateRoom();

  const [selectedOccupancy, setSelectedOccupancy] = useState<Occupancy | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const activeOccupancies = occupancies?.filter(
    (o: Occupancy) => o.occupancy_status === "active"
  ) || [];

  async function handleCheckOut(occupancy: Occupancy) {
    setSelectedOccupancy(occupancy);
    setShowConfirm(true);
  }

  async function confirmCheckOut() {
    if (!selectedOccupancy) return;

    try {
      const now = new Date().toISOString();

      await updateOccupancy.mutateAsync({
        id: selectedOccupancy.id_occupancy,
        data: {
          actual_check_out: now,
          occupancy_status: "completed" as any,
        },
      });

      await updateRoom.mutateAsync({
        id: selectedOccupancy.id_room,
        data: { room_status: "available" as any },
      });

      setShowConfirm(false);
      setSelectedOccupancy(null);
      refetchOccupancies();
      Alert.alert("Success", `Room ${selectedOccupancy.id_room} checked out`);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  }

  return (
    <ThemedView className="flex-1">
      <View className="px-5 py-3 border-b border-gray-100 dark:border-gray-800">
        <View className="flex-row gap-2">
          <StatBadge label="Active" value={activeOccupancies.length} color="#3B82F6" />
          <StatBadge label="Total" value={occupancies?.length || 0} color="#0EA5E9" />
        </View>
      </View>

      <FlatList
        data={activeOccupancies}
        keyExtractor={(item) => item.id_occupancy.toString()}
        renderItem={({ item }) => (
          <OccupancyCard item={item as Occupancy} onCheckOut={handleCheckOut} />
        )}
        contentContainerClassName="px-4 py-4"
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState icon="logout" title="No Active Stays" subtitle="No guests currently checked in" />
          ) : null
        }
      />

      <CheckInOutModals.CheckOutConfirmModal
        visible={showConfirm}
        onClose={() => { setShowConfirm(false); setSelectedOccupancy(null); }}
        onConfirm={confirmCheckOut}
        occupancy={selectedOccupancy}
      />
    </ThemedView>
  );
}
