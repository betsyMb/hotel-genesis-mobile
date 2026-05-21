import { useState } from "react";
import { FlatList, TouchableOpacity, View, Alert } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useReservations, useOccupancies, useCreateOccupancy, useUpdateRoom } from "@/hooks";
import { Reservation } from "@/hooks/api/types";
import { EmptyState, StatBadge } from "@/components/shared";
import { CheckInOutModals } from "@/components/receptionist";
import { MaterialIcons } from "@expo/vector-icons";

function CheckInCard({ item, onCheckIn }: { item: Reservation; onCheckIn: (r: Reservation) => void }) {
  const checkIn = new Date(item.check_in_date);
  const checkOut = new Date(item.check_out_date);
  console.log({item})
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const checkInStr = checkIn.toISOString().split("T")[0];
  const canCheckIn = checkInStr <= todayStr && (item.reservation_status === "confirmed" || item.reservation_status === "pending");

  return (
    <View className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden mb-3 border-2 ${
      canCheckIn ? "border-green-200 dark:border-green-800" : "border-gray-100 dark:border-gray-700"
    }`}>
      <View className="p-4">
        <View className="flex-row justify-between items-start">
          <View className="flex-row items-center flex-1">
            <View className={`w-12 h-12 rounded-xl items-center justify-center mr-3 ${
              canCheckIn ? "bg-green-500/20" : "bg-gray-100 dark:bg-gray-700"
            }`}>
              <MaterialIcons name="login" size={24} color={canCheckIn ? "#10B981" : "#94A3B8"} />
            </View>
            <View className="flex-1">
              <ThemedText type="defaultSemiBold">
                Room {item.room?.room_number || item.id_room}
              </ThemedText>
              <ThemedText className="text-sm opacity-60">
                {item.client?.full_name || `Client #${item.id_client}`}
              </ThemedText>
            </View>
          </View>

          <View className={`px-2.5 py-1 rounded-full ${
            canCheckIn ? "bg-green-500/20" : "bg-gray-100 dark:bg-gray-700"
          }`}>
            <ThemedText className={`text-xs font-semibold ${
              canCheckIn ? "text-green-600" : "opacity-60"
            }`}>
              {canCheckIn ? "Ready" : item.reservation_status}
            </ThemedText>
          </View>
        </View>

        <View className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 mt-3">
          <View className="flex-row items-center">
            <View className="flex-1 items-center">
              <ThemedText className="text-xs opacity-60">Check-in</ThemedText>
              <ThemedText className="font-semibold text-sm mt-0.5">
                {checkIn.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </ThemedText>
            </View>
            <View className="w-8 h-8 rounded-full bg-[#0EA5E9]/10 items-center justify-center mx-2">
              <MaterialIcons name="arrow-forward" size={18} color="#0EA5E9" />
            </View>
            <View className="flex-1 items-center">
              <ThemedText className="text-xs opacity-60">Check-out</ThemedText>
              <ThemedText className="font-semibold text-sm mt-0.5">
                {checkOut.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </ThemedText>
            </View>
          </View>
        </View>

        <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <View className="flex-row items-center">
            <MaterialIcons name="event-note" size={16} color="#94A3B8" />
            <ThemedText className="ml-1 text-sm opacity-70">
              ${item.total_amount}
            </ThemedText>
          </View>
          {canCheckIn && (
            <TouchableOpacity
              className="flex-row items-center bg-green-500 px-4 py-2 rounded-lg"
              onPress={() => onCheckIn(item)}
            >
              <MaterialIcons name="login" size={18} color="white" />
              <ThemedText className="ml-1 text-white font-semibold">Check In</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

export default function ReceptionistCheckinScreen() {
  const { data: reservations, isLoading, refetch: refetchReservations } = useReservations();
  const { data: occupancies } = useOccupancies();
  const createOccupancy = useCreateOccupancy();
  const updateRoom = useUpdateRoom();

  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const upcomingReservations = reservations?.filter(
    (r: Reservation) => r.reservation_status === "pending" || r.reservation_status === "confirmed"
  ) || [];

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const reservationsWithOccupancy = new Set(
    occupancies?.filter((o) => o.id_reservation != null).map((o) => o.id_reservation) || []
  );

  const todayCheckIns = upcomingReservations.filter((r: Reservation) => {
    if (reservationsWithOccupancy.has(r.id_reservation)) return false;
    const checkInDate = new Date(r.check_in_date).toISOString().split("T")[0];
    return checkInDate <= todayStr;
  });

  async function handleCheckIn(reservation: Reservation) {
    setSelectedReservation(reservation);
    setShowConfirm(true);
  }

  async function confirmCheckIn(signature: string) {
    if (!selectedReservation) return;

    try {
      const now = new Date().toISOString();

      await createOccupancy.mutateAsync({
        id_reservation: selectedReservation.id_reservation,
        id_room: selectedReservation.id_room,
        actual_check_in: now,
        occupancy_status: "active",
        guest_signature: signature,
      });

      await updateRoom.mutateAsync({
        id: selectedReservation.id_room,
        data: { room_status: "occupied" as any },
      });

      setShowConfirm(false);
      setSelectedReservation(null);
      refetchReservations();
      Alert.alert("Success", `Checked in to Room ${selectedReservation.room?.room_number}`);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  }

  return (
    <ThemedView className="flex-1">
      <View className="px-5 py-3 border-b border-gray-100 dark:border-gray-800">
        <View className="flex-row gap-2 mb-3">
          <StatBadge label="Arrivals" value={todayCheckIns.length} color="#10B981" />
          <StatBadge label="Active" value={occupancies?.filter((o) => o.occupancy_status === "active").length || 0} color="#3B82F6" />
        </View>
      </View>

      <FlatList
        data={todayCheckIns}
        keyExtractor={(item) => item.id_reservation.toString()}
        renderItem={({ item }) => (
          <CheckInCard item={item as Reservation} onCheckIn={handleCheckIn} />
        )}
        contentContainerClassName="px-4 py-4"
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState icon="check-circle" title="All Caught Up!" subtitle="No pending check-ins for today" />
          ) : null
        }
      />

      <CheckInOutModals.CheckInConfirmModal
        visible={showConfirm}
        onClose={() => { setShowConfirm(false); setSelectedReservation(null); }}
        onConfirm={confirmCheckIn}
        reservation={selectedReservation}
      />
    </ThemedView>
  );
}
