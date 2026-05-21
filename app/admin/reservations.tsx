import { useState } from "react";
import { FlatList, TouchableOpacity, View, Alert, Modal, TextInput } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { StatBadge, EmptyState, ReservationCard, ReservationFormModal, StatusPickerModal, getReservationStatusConfig } from "@/components/shared";
import { useReservations, useRooms, useUsers, useRoles, useCreateReservation, useUpdateReservation, useDeleteReservation, useCreateUser, useOccupancies, useCreateOccupancy, useUpdateRoom, useWalkinCheckout } from "@/hooks";
import { Reservation } from "@/hooks/api/types";
import { MaterialIcons } from "@expo/vector-icons";

const statusConfig = getReservationStatusConfig();

export default function AdminReservationsScreen() {
  const { data: reservations, isLoading, refetch: refetchReservations } = useReservations();
  const { data: rooms } = useRooms();
  const { data: users } = useUsers();
  const { data: roles } = useRoles();
  const { data: occupancies } = useOccupancies();
  const createReservation = useCreateReservation();
  const updateReservation = useUpdateReservation();
  const deleteReservation = useDeleteReservation();
  const createUser = useCreateUser();
  const createOccupancy = useCreateOccupancy();
  const updateRoom = useUpdateRoom();
  const walkinCheckout = useWalkinCheckout();

  const [showForm, setShowForm] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [statusReservation, setStatusReservation] = useState<Reservation | null>(null);
  const [checkInReservation, setCheckInReservation] = useState<Reservation | null>(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [signature, setSignature] = useState("");

  const activeOccupancyRoomIds = new Set(
    (occupancies || [])
      .filter((o) => o.occupancy_status === "active")
      .map((o) => o.id_room),
  );

  const activeReservations = (reservations || []).filter(
    (r: Reservation) => r.reservation_status !== "completed" && r.reservation_status !== "cancelled" && r.reservation_status !== "no_show"
  );

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
    total: activeReservations.length,
    pending: activeReservations.filter((r: Reservation) => r.reservation_status === "pending").length || 0,
    confirmed: activeReservations.filter((r: Reservation) => r.reservation_status === "confirmed").length || 0,
    revenue: (reservations || []).filter((r: Reservation) => r.reservation_status === "completed").reduce((sum: number, r: Reservation) => sum + r.total_amount, 0) || 0,
  };

  function handleCheckIn(reservation: Reservation) {
    setCheckInReservation(reservation);
    setSignature(reservation.client?.full_name || "");
    setShowCheckInModal(true);
  }

  async function confirmCheckIn() {
    if (!checkInReservation) return;
    try {
      const now = new Date().toISOString();
      await createOccupancy.mutateAsync({
        id_reservation: checkInReservation.id_reservation,
        id_room: checkInReservation.id_room,
        actual_check_in: now,
        occupancy_status: "active",
        guest_signature: signature.trim() || checkInReservation.client?.full_name || "Guest",
      });
      await updateRoom.mutateAsync({
        id: checkInReservation.id_room,
        data: { room_status: "occupied" as any },
      });
      setShowCheckInModal(false);
      setCheckInReservation(null);
      refetchReservations();
      Alert.alert("Success", `Checked into Room ${checkInReservation.room?.room_number || checkInReservation.id_room}`);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  }

  function handleCheckOut(reservation: Reservation) {
    const roomNumber = reservation.room?.room_number || `#${reservation.id_room}`;
    Alert.alert(
      "Check-out",
      `Check out ${reservation.client?.full_name || `Client #${reservation.id_client}`} from Room ${roomNumber}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Check Out",
          style: "destructive",
          onPress: async () => {
            try {
              await walkinCheckout.mutateAsync({ room_id: reservation.id_room });
              await updateReservation.mutateAsync({
                id: reservation.id_reservation,
                data: { reservation_status: "completed" as any },
              });
              refetchReservations();
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
          <StatBadge label="Pending" value={stats.pending} color="#F59E0B" />
          <StatBadge label="Confirmed" value={stats.confirmed} color="#10B981" />
          <StatBadge label="Revenue" value={stats.revenue.toString().slice(0,4)} color="#8B5CF6" prefix="$" />
        </View>
      </View>

      <FlatList
        data={activeReservations}
        keyExtractor={(item: Reservation) => item.id_reservation.toString()}
        renderItem={({ item }) => {
          const isCheckedIn = activeOccupancyRoomIds.has(item.id_room);
          return (
            <ReservationCard
              item={item as Reservation}
              onEdit={(r) => { setEditingReservation(r); setShowForm(true); }}
              onDelete={handleDelete}
              onStatusChange={(r) => { setStatusReservation(r); setShowStatusPicker(true); }}
              onCheckIn={!isCheckedIn ? handleCheckIn : undefined}
              onCheckOut={isCheckedIn ? handleCheckOut : undefined}
            />
          );
        }}
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

      <Modal visible={showCheckInModal} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white dark:bg-gray-900 rounded-t-3xl p-6">
            <ThemedText type="title" className="mb-2">Confirm Check-In</ThemedText>
            <ThemedText className="text-sm opacity-60 mb-4">
              Room {checkInReservation?.room?.room_number || checkInReservation?.id_room} — {checkInReservation?.client?.full_name || `Client #${checkInReservation?.id_client}`}
            </ThemedText>
            <ThemedText className="font-semibold text-sm opacity-60 mb-1.5">Guest Signature</ThemedText>
            <TextInput
              className="text-sm dark:text-white py-3 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl mb-4"
              value={signature}
              onChangeText={setSignature}
              placeholder="Enter guest signature"
              placeholderTextColor="#94A3B8"
              autoCapitalize="words"
            />
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 py-3 rounded-xl items-center bg-gray-100 dark:bg-gray-800"
                onPress={() => { setShowCheckInModal(false); setCheckInReservation(null); }}
              >
                <ThemedText className="font-semibold opacity-60">Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3 rounded-xl items-center bg-green-500"
                onPress={confirmCheckIn}
              >
                <ThemedText className="text-white font-semibold">Confirm</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <StatusPickerModal
        visible={showStatusPicker}
        onClose={() => { setShowStatusPicker(false); setStatusReservation(null); }}
        onConfirm={confirmStatusChange}
        reservation={statusReservation}
      />
    </ThemedView>
  );
}


