import { useState } from "react";
import { FlatList, TouchableOpacity, View, Alert } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { StatBadge, EmptyState, ReservationCard, ReservationFormModal, StatusPickerModal, getReservationStatusConfig } from "@/components/shared";
import { useReservations, useRooms, useUsers, useRoles, useCreateReservation, useUpdateReservation, useDeleteReservation, useCreateUser } from "@/hooks";
import { Reservation } from "@/hooks/api/types";
import { MaterialIcons } from "@expo/vector-icons";

const statusConfig = getReservationStatusConfig();

export default function AdminReservationsScreen() {
  const { data: reservations, isLoading } = useReservations();
  const { data: rooms } = useRooms();
  const { data: users } = useUsers();
  const { data: roles } = useRoles();
  const createReservation = useCreateReservation();
  const updateReservation = useUpdateReservation();
  const deleteReservation = useDeleteReservation();
  const createUser = useCreateUser();

  const [showForm, setShowForm] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [statusReservation, setStatusReservation] = useState<Reservation | null>(null);

  async function handleCreate(data: any) {
    try {
      await createReservation.mutateAsync(data);
      Alert.alert("Success", "Reservation created!");
    } catch (err: any) {
      Alert.alert("Error", err.message);
      throw err;
    }
  }

  async function handleUpdate(data: any) {
    if (!editingReservation) return;
    try {
      await updateReservation.mutateAsync({ id: editingReservation.id_reservation, data });
      setEditingReservation(null);
      Alert.alert("Success", "Reservation updated!");
    } catch (err: any) {
      Alert.alert("Error", err.message);
      throw err;
    }
  }

  function handleDelete(id: number) {
    Alert.alert("Delete Reservation", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteReservation.mutateAsync(id);
            Alert.alert("Deleted", "Reservation deleted");
          } catch (err: any) {
            Alert.alert("Error", err.message);
          }
        },
      },
    ]);
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
      await updateReservation.mutateAsync({ id: statusReservation.id_reservation, data: { reservation_status: newStatus as any } });
      setShowStatusPicker(false);
      setStatusReservation(null);
      Alert.alert("Success", "Status updated!");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  }

  const stats = {
    total: reservations?.length || 0,
    pending: reservations?.filter((r: Reservation) => r.reservation_status === "pending").length || 0,
    confirmed: reservations?.filter((r: Reservation) => r.reservation_status === "confirmed").length || 0,
    revenue: reservations?.filter((r: Reservation) => r.reservation_status === "completed").reduce((sum: number, r: Reservation) => sum + r.total_amount, 0) || 0,
  };

  console.log({rooms, users})

  return (
    <ThemedView className="flex-1">
      <View className="px-5 py-3 border-b border-gray-100 dark:border-gray-800">
        <View className="flex-row gap-2 mb-3">
          <StatBadge label="Total" value={stats.total} color="#0EA5E9" />
          <StatBadge label="Pending" value={stats.pending} color="#F59E0B" />
          <StatBadge label="Confirmed" value={stats.confirmed} color="#10B981" />
          <StatBadge label="Revenue" value={stats.revenue} color="#8B5CF6" prefix="$" />
        </View>
      </View>

      <FlatList
        data={reservations || []}
        keyExtractor={(item: Reservation) => item.id_reservation.toString()}
        renderItem={({ item }) => (
          <ReservationCard
            item={item as Reservation}
            onEdit={(r) => { setEditingReservation(r); setShowForm(true); }}
            onDelete={handleDelete}
            onStatusChange={(r) => { setStatusReservation(r); setShowStatusPicker(true); }}
          />
        )}
        contentContainerClassName="px-4 py-4"
        ListEmptyComponent={!isLoading ? <EmptyState icon="event-note" title="No reservations found" /> : null}
      />

      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-[#0EA5E9] items-center justify-center shadow-lg"
        onPress={() => { setEditingReservation(null); setShowForm(true); }}
      >
        <MaterialIcons name="add" size={28} color="white" />
      </TouchableOpacity>

      <ReservationFormModal
        visible={showForm}
        onClose={() => { setShowForm(false); setEditingReservation(null); }}
        onSubmit={editingReservation ? handleUpdate : handleCreate}
        editingReservation={editingReservation}
        rooms={rooms || []}
        users={users || []}
        onCreateClient={editingReservation ? undefined : handleCreateClient}
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


