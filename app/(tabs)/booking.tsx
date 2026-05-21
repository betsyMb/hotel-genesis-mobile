import { useState } from "react";
import { FlatList, TouchableOpacity, View, Alert, ActivityIndicator, ScrollView, TextInput } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuth, useReservations, useRooms, useCreateReservation, useUpdateUser } from "@/hooks";
import { ClientRoomCard } from "@/components/client/ClientRoomCard";
import { ClientReservationCard } from "@/components/client/ClientReservationCard";
import { EmptyState, StatBadge } from "@/components/shared";
import { GuestFormRow } from "@/components/walkin";
import { MaterialIcons } from "@expo/vector-icons";
import { Reservation, Room } from "@/hooks/api/types";
import { WalkInGuest } from "@/hooks/api/walkin-types";

export default function BookingScreen() {
  const { user } = useAuth();
  const { data: reservations, isLoading, refetch } = useReservations();
  const { data: rooms } = useRooms();
  const createReservation = useCreateReservation();
  const updateUser = useUpdateUser();

  const [showForm, setShowForm] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("1");
  const [notes, setNotes] = useState("");
  const [name, setName] = useState(user?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [dni, setDni] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [additionalGuests, setAdditionalGuests] = useState<WalkInGuest[]>([]);

  const myReservations = reservations
    ?.filter((r: Reservation) => Number(r.id_client) === Number(user?.id_user))
    .sort((a: Reservation, b: Reservation) =>
      new Date(b.check_in_date).getTime() - new Date(a.check_in_date).getTime()
    ) || [];

  async function handleCreateReservation() {
    if (!selectedRoom || !checkIn || !checkOut) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }
    if (!dni.trim()) {
      Alert.alert("Error", "DNI is required");
      return;
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (nights <= 0) {
      Alert.alert("Error", "Check-out must be after check-in");
      return;
    }

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      Alert.alert("Error", "Invalid date format. Use YYYY-MM-DD");
      return;
    }

    setSubmitting(true);

    try {
      const totalGuests = Number(guests) + additionalGuests.length;

      await createReservation.mutateAsync({
        id_client: Number(user!.id_user),
        id_room: selectedRoom.id_room,
        check_in_date: checkInDate.toISOString(),
        check_out_date: checkOutDate.toISOString(),
        number_of_guests: totalGuests || 1,
        reservation_status: "pending",
        total_amount: selectedRoom.price_per_night * nights,
        notes: notes || undefined,
      });

      const updateData: any = {};
      if (name !== user?.full_name) updateData.full_name = name;
      if (email !== user?.email) updateData.email = email;
      if (phone !== user?.phone) updateData.phone = phone;
      if (dni) updateData.dni = dni;
      if (Object.keys(updateData).length > 0) {
        await updateUser.mutateAsync({ id: Number(user!.id_user), data: updateData });
      }

      setShowForm(false);
      setSelectedRoom(null);
      setCheckIn("");
      setCheckOut("");
      setGuests("1");
      setNotes("");
      setDni("");
      setAdditionalGuests([]);
      refetch();
      Alert.alert("Success", "Reservation created!");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function addGuestRow() {
    setAdditionalGuests([...additionalGuests, { first_name: "", last_name: "", dni: "", phone_number: "" }]);
  }

  function updateGuest(index: number, field: keyof WalkInGuest, value: string) {
    const updated = [...additionalGuests];
    updated[index] = { ...updated[index], [field]: value };
    setAdditionalGuests(updated);
  }

  function removeGuest(index: number) {
    setAdditionalGuests(additionalGuests.filter((_, i) => i !== index));
  }

  if (showForm) {
    const checkInDate = checkIn ? new Date(checkIn) : null;
    const checkOutDate = checkOut ? new Date(checkOut) : null;
    const nights =
      checkInDate && checkOutDate
        ? Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0;
    const estimatedTotal = selectedRoom && nights > 0 ? selectedRoom.price_per_night * nights : null;

    const availableRooms = (rooms?.filter((r) => r.room_status === "available") || []) as Room[];

    return (
      <ThemedView className="flex-1">
        <View className="px-5 py-4 flex-row items-center border-b border-gray-100 dark:border-gray-800">
          <TouchableOpacity onPress={() => setShowForm(false)} className="mr-4">
            <MaterialIcons name="arrow-back" size={24} color="#334155" />
          </TouchableOpacity>
          <ThemedText type="title">New Reservation</ThemedText>
        </View>

        <ScrollView className="flex-1" contentContainerClassName="p-5">
          <ThemedText className="font-semibold text-sm opacity-60 mb-1.5 uppercase">Room *</ThemedText>
          {selectedRoom ? (
            <TouchableOpacity
              className="flex-row items-center justify-between bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 mb-4"
              onPress={() => setSelectedRoom(null)}
            >
              <View className="flex-row items-center flex-1">
                <MaterialIcons name="hotel" size={20} color="#94A3B8" style={{ marginRight: 10 }} />
                <View>
                  <ThemedText className="font-semibold">Room {selectedRoom.room_number}</ThemedText>
                  <ThemedText className="text-xs opacity-60">{selectedRoom.room_type} - ${selectedRoom.price_per_night}/night</ThemedText>
                </View>
              </View>
              <MaterialIcons name="close" size={22} color="#EF4444" />
            </TouchableOpacity>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              <View className="flex-row gap-3">
                {availableRooms.map((room) => (
                  <TouchableOpacity key={room.id_room} onPress={() => setSelectedRoom(room)}>
                    <ClientRoomCard item={room} onPress={() => setSelectedRoom(room)} />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}

          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <ThemedText className="font-semibold text-sm opacity-60 mb-1.5">CHECK-IN *</ThemedText>
              <TextInput
                value={checkIn}
                onChangeText={setCheckIn}
                placeholder="2026-05-01"
                placeholderTextColor="#94A3B8"
                className="text-sm dark:text-white py-3 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                autoCapitalize="none"
              />
            </View>
            <View className="flex-1">
              <ThemedText className="font-semibold text-sm opacity-60 mb-1.5">CHECK-OUT *</ThemedText>
              <TextInput
                value={checkOut}
                onChangeText={setCheckOut}
                placeholder="2026-05-05"
                placeholderTextColor="#94A3B8"
                className="text-sm dark:text-white py-3 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View className="mb-4">
            <ThemedText className="font-semibold text-sm opacity-60 mb-1.5 uppercase">Your Information</ThemedText>
            <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <TextInput
                className="text-sm dark:text-white py-3 px-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl mb-2"
                placeholder="Full name *"
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
              <TextInput
                className="text-sm dark:text-white py-3 px-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl mb-2"
                placeholder="Email *"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                className="text-sm dark:text-white py-3 px-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl mb-2"
                placeholder="Phone"
                placeholderTextColor="#94A3B8"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <TextInput
                className="text-sm dark:text-white py-3 px-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl"
                placeholder="DNI *"
                placeholderTextColor="#94A3B8"
                value={dni}
                onChangeText={setDni}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View className="mb-4">
            <ThemedText className="font-semibold text-sm opacity-60 mb-1.5 uppercase">Guests</ThemedText>
            <TextInput
              value={guests}
              onChangeText={setGuests}
              placeholder="1"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              className="text-sm dark:text-white py-3 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
            />
          </View>

          <View className="mb-4">
            <View className="flex-row justify-between items-center mb-2">
              <ThemedText className="font-semibold text-sm opacity-60 uppercase">Additional Guests</ThemedText>
              <TouchableOpacity className="flex-row items-center" onPress={addGuestRow}>
                <MaterialIcons name="person-add" size={18} color="#0EA5E9" />
                <ThemedText className="ml-1 text-[#0EA5E9] text-sm font-semibold">Add</ThemedText>
              </TouchableOpacity>
            </View>
            {additionalGuests.map((g, i) => (
              <GuestFormRow key={i} guest={g} index={i} onChange={updateGuest} onRemove={removeGuest} />
            ))}
            {additionalGuests.length === 0 && (
              <ThemedText className="text-xs opacity-50 italic">No additional guests</ThemedText>
            )}
          </View>

          <View className="mb-6">
            <ThemedText className="font-semibold text-sm opacity-60 mb-1.5 uppercase">Notes</ThemedText>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Special requests..."
              placeholderTextColor="#94A3B8"
              className="text-sm dark:text-white py-3 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
              multiline
            />
          </View>

          {estimatedTotal !== null && (
            <View className="bg-[#0EA5E9]/5 border border-[#0EA5E9]/20 rounded-2xl p-4 mb-6">
              <View className="flex-row justify-between items-center">
                <View>
                  <ThemedText className="text-sm opacity-60">Estimate</ThemedText>
                  <ThemedText className="text-sm opacity-60">
                    {nights} {nights === 1 ? "night" : "nights"} × ${selectedRoom?.price_per_night}
                  </ThemedText>
                </View>
                <ThemedText className="text-2xl font-bold text-[#0EA5E9]">
                  ${estimatedTotal}
                </ThemedText>
              </View>
            </View>
          )}

          <TouchableOpacity
            className="bg-[#0EA5E9] py-4 rounded-xl items-center disabled:opacity-50"
            onPress={handleCreateReservation}
            disabled={submitting || !selectedRoom || !checkIn || !checkOut || !dni.trim()}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <ThemedText className="text-white font-semibold text-base">
                Create Reservation
              </ThemedText>
            )}
          </TouchableOpacity>
        </ScrollView>
      </ThemedView>
    );
  }

  const pendingCount = myReservations.filter((r) => r.reservation_status === "pending").length;

  return (
    <ThemedView className="flex-1">
      <ThemedView className="px-5 py-4 flex-row justify-between items-center border-b border-gray-100 dark:border-gray-800">
        <View>
          <ThemedText type="title">My Bookings</ThemedText>
          <ThemedText className="opacity-60 mt-0.5">
            {myReservations.length} {myReservations.length === 1 ? "reservation" : "reservations"}
          </ThemedText>
        </View>
        <TouchableOpacity
          className="flex-row items-center bg-[#0EA5E9] px-4 py-2.5 rounded-xl"
          onPress={() => setShowForm(true)}
        >
          <MaterialIcons name="add" size={20} color="white" />
          <ThemedText className="text-white font-semibold ml-1">New</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <View className="px-5 py-2 border-b border-gray-100 dark:border-gray-800">
        <View className="flex-row gap-2">
          <StatBadge label="Total" value={myReservations.length} color="#0EA5E9" />
          <StatBadge label="Pending" value={pendingCount} color="#F59E0B" />
        </View>
      </View>

      {isLoading && (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0EA5E9" />
          <ThemedText className="mt-4 opacity-60">Loading bookings...</ThemedText>
        </View>
      )}

      {!isLoading && myReservations.length === 0 && (
        <EmptyState icon="event-note" title="No reservations yet" subtitle="Tap the + New button to book your first room" />
      )}

      {!isLoading && myReservations.length > 0 && (
        <FlatList
          data={myReservations}
          keyExtractor={(item) => item.id_reservation.toString()}
          renderItem={({ item }) => <ClientReservationCard item={item as Reservation} />}
          contentContainerClassName="px-4 py-4"
        />
      )}
    </ThemedView>
  );
}
