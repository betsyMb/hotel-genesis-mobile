import { useState } from "react";
import { FlatList, TouchableOpacity, View, Alert, ActivityIndicator, ScrollView } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ThemedTextInput from "@/components/ThemedTextInput";
import { useAuth, useReservations, useRooms, useCreateReservation } from "@/hooks";
import { ClientRoomCard } from "@/components/client/ClientRoomCard";
import { ClientReservationCard } from "@/components/client/ClientReservationCard";
import { EmptyState, StatBadge } from "@/components/shared";
import { MaterialIcons } from "@expo/vector-icons";
import { Reservation, Room } from "@/hooks/api/types";

export default function BookingScreen() {
  const { user } = useAuth();
  const { data: reservations, isLoading, refetch } = useReservations();
  const { data: rooms } = useRooms();
  const createReservation = useCreateReservation();

  const [showForm, setShowForm] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("1");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const myReservations = reservations
    ?.filter((r: Reservation) => r.id_client === user?.id_user)
    .sort((a: Reservation, b: Reservation) =>
      new Date(b.check_in_date).getTime() - new Date(a.check_in_date).getTime()
    ) || [];

  async function handleCreateReservation() {
    if (!selectedRoom || !checkIn || !checkOut) {
      Alert.alert("Error", "Please fill in all required fields");
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
      await createReservation.mutateAsync({
        id_client: user!.id_user,
        id_room: selectedRoom.id_room,
        check_in_date: checkInDate.toISOString(),
        check_out_date: checkOutDate.toISOString(),
        number_of_guests: Number(guests),
        reservation_status: "pending",
        total_amount: selectedRoom.price_per_night * nights,
        notes: notes || undefined,
      });

      setShowForm(false);
      setSelectedRoom(null);
      setCheckIn("");
      setCheckOut("");
      setGuests("1");
      setNotes("");
      refetch();
      Alert.alert("Success", "Reservation created!");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (showForm) {
    const checkInDate = checkIn ? new Date(checkIn) : null;
    const checkOutDate = checkOut ? new Date(checkOut) : null;
    const nights =
      checkInDate && checkOutDate
        ? Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0;
    const estimatedTotal = selectedRoom && nights > 0 ? selectedRoom.price_per_night * nights : null;

    const availableRooms = rooms?.filter((r) => r.room_status === "available") || [];

    return (
      <ThemedView className="flex-1">
        <ThemedView className="px-5 py-4 flex-row items-center border-b border-gray-100 dark:border-gray-800">
          <TouchableOpacity onPress={() => setShowForm(false)} className="mr-4">
            <MaterialIcons name="arrow-back" size={24} color="#334155" />
          </TouchableOpacity>
          <ThemedText type="title">New Reservation</ThemedText>
        </ThemedView>

        <ScrollView className="flex-1" contentContainerClassName="p-5">
          <ThemedText className="font-semibold text-sm opacity-60 mb-2">SELECT A ROOM</ThemedText>
          <FlatList
            data={availableRooms}
            keyExtractor={(item) => item.id_room.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="pb-2"
            renderItem={({ item }) => (
              <View className={`mr-3 p-1 rounded-2xl ${selectedRoom?.id_room === item.id_room ? "bg-[#0EA5E9]" : ""}`}>
                <ClientRoomCard
                  item={item}
                  onPress={() => setSelectedRoom(item)}
                />
              </View>
            )}
            className="mb-5"
          />

          <View className="mb-5">
            <ThemedText className="font-semibold text-sm opacity-60 mb-2">CHECK-IN *</ThemedText>
            <ThemedTextInput
              placeholder="2026-05-01"
              value={checkIn}
              onChangeText={setCheckIn}
              keyboardType="default"
              autoCapitalize="none"
              className="bg-white dark:bg-gray-800"
            />
          </View>

          <View className="mb-5">
            <ThemedText className="font-semibold text-sm opacity-60 mb-2">CHECK-OUT *</ThemedText>
            <ThemedTextInput
              placeholder="2026-05-05"
              value={checkOut}
              onChangeText={setCheckOut}
              keyboardType="default"
              autoCapitalize="none"
              className="bg-white dark:bg-gray-800"
            />
          </View>

          <View className="mb-5">
            <ThemedText className="font-semibold text-sm opacity-60 mb-2">GUESTS</ThemedText>
            <ThemedTextInput
              placeholder="1"
              value={guests}
              onChangeText={setGuests}
              keyboardType="number-pad"
              className="bg-white dark:bg-gray-800"
            />
          </View>

          <View className="mb-6">
            <ThemedText className="font-semibold text-sm opacity-60 mb-2">NOTES (OPTIONAL)</ThemedText>
            <ThemedTextInput
              placeholder="Special requests..."
              value={notes}
              onChangeText={setNotes}
              className="bg-white dark:bg-gray-800"
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
            disabled={submitting || !selectedRoom || !checkIn || !checkOut}
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
