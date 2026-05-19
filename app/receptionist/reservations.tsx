import { useState } from "react";
import { FlatList, TouchableOpacity, View, Alert } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useReservations, useRooms, useUsers, useRoles, useCreateReservation, useUpdateReservation, useCreateUser } from "@/hooks";
import { Reservation } from "@/hooks/api/types";
import { EmptyState, StatBadge, ReservationFormModal, StatusPickerModal } from "@/components/shared";
import { ReservationCard } from "@/components/receptionist";
import { MaterialIcons } from "@expo/vector-icons";

export default function ReceptionistReservationsScreen() {
  const { data: reservations, isLoading } = useReservations();
  const { data: rooms } = useRooms();
  const { data: users } = useUsers();
  const { data: roles } = useRoles();
  const createReservation = useCreateReservation();
  const updateReservation = useUpdateReservation();
  const createUser = useCreateUser();

  const [showForm, setShowForm] = useState(false);
  const [statusReservation, setStatusReservation] = useState<Reservation | null>(null);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  async function handleStatusChange(reservation: Reservation) {
    setStatusReservation(reservation);
    setShowStatusPicker(true);
  }

  async function handleCreate(data: any) {
    try {
      await createReservation.mutateAsync(data);
      Alert.alert("Success", "Reservation created!");
    } catch (err: any) {
      Alert.alert("Error", err.message);
      throw err;
    }
  }

  async function handleCreateClient(data: { full_name: string; email: string; phone?: string }): Promise<number> {
    const clientRole = roles?.find((r) => r.role_name === "Client");
    if (!clientRole) throw new Error("Client role not found");
    const user = await createUser.mutateAsync({
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      id_rol: clientRole.id_rol,
      password_hash: "reservation123",
      is_active: true,
      role: "Client",
    } as any);
    return user.id_user;
  }

  async function confirmStatusChange(newStatus: string) {
    if (!statusReservation) return;
    try {
      await updateReservation.mutateAsync({
        id: statusReservation.id_reservation,
        data: { reservation_status: newStatus as any },
      });
      setShowStatusPicker(false);
      setStatusReservation(null);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  }

  const filteredReservations = filter === "all"
    ? reservations || []
    : reservations?.filter((r: Reservation) => r.reservation_status === filter) || [];

  const stats = {
    all: reservations?.length || 0,
    pending: reservations?.filter((r: Reservation) => r.reservation_status === "pending").length || 0,
    confirmed: reservations?.filter((r: Reservation) => r.reservation_status === "confirmed").length || 0,
  };

  return (
    <ThemedView className="flex-1">
      <View className="px-5 py-3 border-b border-gray-100 dark:border-gray-800">
        <View className="flex-row gap-2 mb-3">
          <StatBadge label="All" value={stats.all} color="#0EA5E9" />
          <StatBadge label="Pending" value={stats.pending} color="#F59E0B" />
          <StatBadge label="Confirmed" value={stats.confirmed} color="#10B981" />
        </View>

        <View className="flex-row bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {["all", "pending", "confirmed"].map((f) => (
            <TouchableOpacity key={f} className={`flex-1 py-2 rounded-lg items-center ${filter === f ? "bg-white dark:bg-gray-700 shadow-sm" : ""}`} onPress={() => setFilter(f)}>
              <ThemedText className={`text-sm font-semibold ${filter === f ? "text-[#0EA5E9]" : "opacity-60"}`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredReservations}
        keyExtractor={(item: Reservation) => item.id_reservation.toString()}
        renderItem={({ item }) => (
          <ReservationCard
            item={item as Reservation}
            onEdit={() => {}}
            onStatusChange={handleStatusChange}
          />
        )}
        contentContainerClassName="px-4 py-4"
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState icon="event-note" title="No reservations found" />
          ) : null
        }
      />

      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-[#0EA5E9] items-center justify-center shadow-lg"
        onPress={() => { setShowForm(true); }}
      >
        <MaterialIcons name="add" size={28} color="white" />
      </TouchableOpacity>

      <ReservationFormModal
        visible={showForm}
        onClose={() => { setShowForm(false); }}
        onSubmit={handleCreate}
        editingReservation={null}
        rooms={rooms || []}
        users={users || []}
        onCreateClient={handleCreateClient}
      />

      <StatusPickerModal
        visible={showStatusPicker}
        onClose={() => { setShowStatusPicker(false); setStatusReservation(null); }}
        onConfirm={confirmStatusChange}
        reservation={statusReservation}
      />
    </ThemedView>
  );
}
