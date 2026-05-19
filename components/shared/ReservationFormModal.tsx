import { useState, useEffect, Component, type ReactNode } from "react";
import { ScrollView, TouchableOpacity, View, Alert, TextInput, FlatList, ActivityIndicator, Text } from "react-native";

class ErrorBoundary extends Component<{children: ReactNode}> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: any) {
    console.error("ErrorBoundary caught:", error.message, info?.componentStack);
  }
  render() {
    if (this.state.error) {
      return <Text className="text-red-500 p-4">Error: {this.state.error.message}</Text>;
    }
    return this.props.children;
  }
}

import { ThemedText } from "@/components/ThemedText";
import { MaterialIcons } from "@expo/vector-icons";
import { Room, User, Reservation } from "@/hooks/api/types";
import { getReservationStatusConfig } from "./ReservationCard";

const statusConfig = getReservationStatusConfig();

interface ReservationFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  editingReservation: Reservation | null;
  rooms: Room[];
  users: User[];
  onCreateClient?: (data: { full_name: string; email: string; phone?: string }) => Promise<number>;
}

type PickerMode = null | "room" | "client";



export function ReservationFormModal({
  visible,
  onClose,
  onSubmit,
  editingReservation,
  rooms,
  users,
  onCreateClient,
}: ReservationFormModalProps) {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [guests, setGuests] = useState("1");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<Reservation["reservation_status"]>("pending");
  const [submitting, setSubmitting] = useState(false);
  const [picker, setPicker] = useState<PickerMode>(null);
  const [search, setSearch] = useState("");

  const [clientMode, setClientMode] = useState<"existing" | "new">("existing");
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");



  useEffect(() => {
    if (visible) {
      if (editingReservation) {
        setSelectedRoom(rooms.find((r) => r.id_room === editingReservation.id_room) || null);
        setSelectedClient(users.find((u) => u.id_user === editingReservation.id_client) || null);
        setCheckInDate(editingReservation.check_in_date?.split("T")[0] || "");
        setCheckOutDate(editingReservation.check_out_date?.split("T")[0] || "");
        setGuests(editingReservation.number_of_guests?.toString() || "1");
        setNotes(editingReservation.notes || "");
        setStatus(editingReservation.reservation_status || "pending");
        setClientMode("existing");
      } else {
        setSelectedRoom(null);
        setSelectedClient(null);
        setCheckInDate("");
        setCheckOutDate("");
        setGuests("1");
        setNotes("");
        setStatus("pending");
        setClientMode("existing");
        setNewName("");
        setNewEmail("");
        setNewPhone("");
      }
      setPicker(null);
      setSearch("");
      setSubmitting(false);
    }
  }, [visible, editingReservation]);

  const parsedCheckIn = checkInDate ? new Date(checkInDate) : null;
  const parsedCheckOut = checkOutDate ? new Date(checkOutDate) : null;
  const nights = parsedCheckIn && parsedCheckOut && !isNaN(parsedCheckIn.getTime()) && !isNaN(parsedCheckOut.getTime())
    ? Math.ceil((parsedCheckOut.getTime() - parsedCheckIn.getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const estimatedTotal = selectedRoom && nights > 0 ? selectedRoom.price_per_night * nights : editingReservation?.total_amount || null;

  const clientList = users?.filter((u) => u.role === "Client") || [];

  const filteredClients = clientList.filter((u) =>
    !search.trim() ||
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const filteredRooms = (rooms || []).filter((r) =>
    !search.trim() ||
    r.room_number.toLowerCase().includes(search.toLowerCase()) ||
    r.room_type.toLowerCase().includes(search.toLowerCase())
  );



  async function handleSubmit() {
    if (!selectedRoom) { Alert.alert("Error", "Please select a room"); return; }

    let clientId: number;

    if (clientMode === "existing") {
      if (!selectedClient) { Alert.alert("Error", "Please select a client"); return; }
      clientId = selectedClient.id_user;
    } else {
      if (!newName.trim() || !newEmail.trim()) {
        Alert.alert("Error", "Please enter the client's name and email");
        return;
      }
      if (!onCreateClient) { Alert.alert("Error", "Client creation not available"); return; }
      try {
        clientId = await onCreateClient({ full_name: newName.trim(), email: newEmail.trim(), phone: newPhone.trim() || undefined });
      } catch (err: any) {
        Alert.alert("Error", err.message);
        return;
      }
    }

    if (!checkInDate || !checkOutDate) { Alert.alert("Error", "Please enter check-in and check-out dates"); return; }
    if (nights <= 0) { Alert.alert("Error", "Check-out must be after check-in"); return; }
    if (!parsedCheckIn || !parsedCheckOut || isNaN(parsedCheckIn.getTime()) || isNaN(parsedCheckOut.getTime())) {
      Alert.alert("Error", "Invalid date format. Use YYYY-MM-DD");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        id_client: clientId,
        id_room: selectedRoom.id_room,
        check_in_date: parsedCheckIn.toISOString(),
        check_out_date: parsedCheckOut.toISOString(),
        number_of_guests: Number(guests) || 1,
        reservation_status: status,
        total_amount: estimatedTotal || 0,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setSubmitting(false);
    }
  }



  if (!visible) return null;

  return (
    <View className="absolute inset-0 z-50">
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white dark:bg-gray-900 rounded-t-3xl p-6 flex-1 max-h-[80%]">
          {picker === "room" ? (
            <>
              <View className="flex-row justify-between items-center mb-4">
                <ThemedText type="title">Select Room</ThemedText>
                <TouchableOpacity onPress={() => { setPicker(null); setSearch(""); }}>
                  <MaterialIcons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>
              <TextInput
                className="text-sm dark:text-white py-3 px-4 bg-gray-100 dark:bg-gray-800 rounded-xl mb-4"
                placeholder="Search by room number or type..."
                placeholderTextColor="#94A3B8"
                value={search}
                onChangeText={setSearch}
                autoCapitalize="none"
              />
              {filteredRooms.length === 0 ? (
                <ThemedText className="opacity-60 italic text-center py-8">No rooms found</ThemedText>
              ) : (
                <FlatList
                  data={filteredRooms}
                  keyExtractor={(item) => item.id_room.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      className={`flex-row items-center p-4 rounded-xl mb-2 border ${
                        selectedRoom?.id_room === item.id_room
                          ? "border-[#0EA5E9] bg-[#0EA5E9]/5"
                          : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                      }`}
                      onPress={() => { setSelectedRoom(item); setPicker(null); setSearch(""); }}
                    >
                      <View className="w-10 h-10 rounded-lg bg-[#0EA5E9]/10 items-center justify-center mr-3">
                        <MaterialIcons name="hotel" size={22} color="#0EA5E9" />
                      </View>
                      <View className="flex-1">
                        <ThemedText className="font-semibold">Room {item.room_number}</ThemedText>
                        <ThemedText className="text-xs opacity-60">
                          {item.room_type} - ${item.price_per_night}/night - {item.room_status}
                        </ThemedText>
                      </View>
                      {selectedRoom?.id_room === item.id_room && (
                        <MaterialIcons name="check-circle" size={22} color="#0EA5E9" />
                      )}
                    </TouchableOpacity>
                  )}
                />
              )}
            </>
          ) : picker === "client" ? (
            <>
              <View className="flex-row justify-between items-center mb-4">
                <ThemedText type="title">Select Client</ThemedText>
                <TouchableOpacity onPress={() => { setPicker(null); setSearch(""); }}>
                  <MaterialIcons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>
              <TextInput
                className="text-sm dark:text-white py-3 px-4 bg-gray-100 dark:bg-gray-800 rounded-xl mb-4"
                placeholder="Search by name or email..."
                placeholderTextColor="#94A3B8"
                value={search}
                onChangeText={setSearch}
                autoCapitalize="none"
              />
              {filteredClients.length === 0 ? (
                <ThemedText className="opacity-60 italic text-center py-8">No clients found</ThemedText>
              ) : (
                <FlatList
                  data={filteredClients}
                  keyExtractor={(item) => item.id_user.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      className={`flex-row items-center p-4 rounded-xl mb-2 border ${
                        selectedClient?.id_user === item.id_user
                          ? "border-[#0EA5E9] bg-[#0EA5E9]/5"
                          : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                      }`}
                      onPress={() => { setSelectedClient(item); setPicker(null); setSearch(""); setClientMode("existing"); }}
                    >
                      <View className="w-10 h-10 rounded-lg bg-[#0EA5E9]/10 items-center justify-center mr-3">
                        <MaterialIcons name="person" size={22} color="#0EA5E9" />
                      </View>
                      <View className="flex-1">
                        <ThemedText className="font-semibold">{item.full_name}</ThemedText>
                        <ThemedText className="text-xs opacity-60">{item.email}</ThemedText>
                      </View>
                      {selectedClient?.id_user === item.id_user && (
                        <MaterialIcons name="check-circle" size={22} color="#0EA5E9" />
                      )}
                    </TouchableOpacity>
                  )}
                />
              )}
            </>
          ) : (
            <>
              <View className="flex-row justify-between items-center mb-5">
                <ThemedText type="title">{editingReservation ? "Edit Reservation" : "New Reservation"}</ThemedText>
                <TouchableOpacity onPress={onClose}>
                  <MaterialIcons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ErrorBoundary>
              <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
                <ThemedText className="font-semibold text-sm opacity-60 mb-1.5 uppercase">Client *</ThemedText>

                {onCreateClient && !editingReservation && (
                  <View className="flex-row bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-3">
                    <TouchableOpacity
                      className={`flex-1 py-2 rounded-lg items-center ${clientMode === "existing" ? "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600" : ""}`}
                      onPress={() => setClientMode("existing")}
                    >
                      <ThemedText className={`text-sm font-semibold ${clientMode === "existing" ? "text-[#0EA5E9]" : "opacity-60"}`}>Existing</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className={`flex-1 py-2 rounded-lg items-center ${clientMode === "new" ? "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600" : ""}`}
                      onPress={() => setClientMode("new")}
                    >
                      <ThemedText className={`text-sm font-semibold ${clientMode === "new" ? "text-[#0EA5E9]" : "opacity-60"}`}>New</ThemedText>
                    </TouchableOpacity>
                  </View>
                )}

                {clientMode === "existing" ? (
                  <TouchableOpacity
                    className="flex-row items-center justify-between bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 mb-4"
                    onPress={() => { setPicker("client"); setSearch(""); }}
                  >
                    <View className="flex-row items-center flex-1">
                      <MaterialIcons name="person" size={20} color="#94A3B8" style={{ marginRight: 10 }} />
                      {selectedClient ? (
                        <View>
                          <ThemedText className="font-semibold">{selectedClient.full_name}</ThemedText>
                          <ThemedText className="text-xs opacity-60">{selectedClient.email}</ThemedText>
                        </View>
                      ) : (
                        <ThemedText className="opacity-50">Tap to select a client</ThemedText>
                      )}
                    </View>
                    <MaterialIcons name="expand-more" size={22} color="#94A3B8" />
                  </TouchableOpacity>
                ) : (
                  <View className="mb-4">
                    <TextInput
                      className="text-sm dark:text-white py-3 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl mb-2"
                      placeholder="Full name *"
                      placeholderTextColor="#94A3B8"
                      value={newName}
                      onChangeText={setNewName}
                      autoCapitalize="words"
                    />
                    <TextInput
                      className="text-sm dark:text-white py-3 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl mb-2"
                      placeholder="Email *"
                      placeholderTextColor="#94A3B8"
                      value={newEmail}
                      onChangeText={setNewEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                    <TextInput
                      className="text-sm dark:text-white py-3 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                      placeholder="Phone (optional)"
                      placeholderTextColor="#94A3B8"
                      value={newPhone}
                      onChangeText={setNewPhone}
                      keyboardType="phone-pad"
                    />
                  </View>
                )}

                <ThemedText className="font-semibold text-sm opacity-60 mb-1.5 uppercase">Room *</ThemedText>
                <TouchableOpacity
                  className="flex-row items-center justify-between bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 mb-4"
                  onPress={() => { setPicker("room"); setSearch(""); }}
                >
                  <View className="flex-row items-center flex-1">
                    <MaterialIcons name="hotel" size={20} color="#94A3B8" style={{ marginRight: 10 }} />
                    {selectedRoom ? (
                      <View>
                        <ThemedText className="font-semibold">Room {selectedRoom.room_number}</ThemedText>
                        <ThemedText className="text-xs opacity-60">{selectedRoom.room_type} - ${selectedRoom.price_per_night}/night</ThemedText>
                      </View>
                    ) : (
                      <ThemedText className="opacity-50">Tap to select a room</ThemedText>
                    )}
                  </View>
                  <MaterialIcons name="expand-more" size={22} color="#94A3B8" />
                </TouchableOpacity>

                <View className="flex-row gap-3 mb-4">
                  <View className="flex-1">
                    <ThemedText className="font-semibold text-sm opacity-60 mb-1.5">CHECK-IN *</ThemedText>
                    <TextInput
                      value={checkInDate}
                      onChangeText={setCheckInDate}
                      placeholder="2026-05-01"
                      placeholderTextColor="#94A3B8"
                      className="text-sm dark:text-white py-3 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                      autoCapitalize="none"
                    />
                  </View>
                  <View className="flex-1">
                    <ThemedText className="font-semibold text-sm opacity-60 mb-1.5">CHECK-OUT *</ThemedText>
                    <TextInput
                      value={checkOutDate}
                      onChangeText={setCheckOutDate}
                      placeholder="2026-05-05"
                      placeholderTextColor="#94A3B8"
                      className="text-sm dark:text-white py-3 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <View className="flex-row gap-3 mb-4">
                  <View className="flex-1">
                    <ThemedText className="font-semibold text-sm opacity-60 mb-1.5">GUESTS</ThemedText>
                    <TextInput
                      value={guests}
                      onChangeText={setGuests}
                      placeholder="1"
                      placeholderTextColor="#94A3B8"
                      keyboardType="number-pad"
                      className="text-sm dark:text-white py-3 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                    />
                  </View>
                  <View className="flex-1">
                    <ThemedText className="font-semibold text-sm opacity-60 mb-1.5">TOTAL</ThemedText>
                    <View className="py-3 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                      <ThemedText className="font-semibold text-[#0EA5E9]">
                        ${estimatedTotal ?? 0}
                      </ThemedText>
                    </View>
                  </View>
                </View>

                {editingReservation && (
                  <>
                    <ThemedText className="font-semibold text-sm opacity-60 mb-1.5">STATUS</ThemedText>
                    <View className="flex-row flex-wrap gap-2 mb-4">
                      {(Object.entries(statusConfig) as [string, { color: string; icon: string; bg: string; label: string }][]).map(([key, val]) => (
                        <TouchableOpacity
                          key={key}
                          className={`px-3 py-1.5 rounded-full ${status === key ? "bg-[#0EA5E9]" : "bg-gray-100 dark:bg-gray-800}"}`}
                          onPress={() => setStatus(key as Reservation["reservation_status"])}
                        >
                          <ThemedText className={`${status === key ? "text-white text-xs font-semibold" : "text-xs"}`}>{val.label}</ThemedText>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}

                <ThemedText className="font-semibold text-sm opacity-60 mb-1.5">NOTES</ThemedText>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Optional notes..."
                  placeholderTextColor="#94A3B8"
                  className="text-sm dark:text-white py-3 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl mb-6"
                  multiline
                />

                <TouchableOpacity
                  className="bg-[#0EA5E9] py-4 rounded-xl items-center disabled:opacity-50 mb-4"
                  onPress={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <ThemedText className="text-white font-semibold text-base">
                      {editingReservation ? "Update" : "Create"} Reservation
                    </ThemedText>
                  )}
                </TouchableOpacity>
              </ScrollView>
              </ErrorBoundary>
            </>
          )}
        </View>
      </View>
    </View>
  );
}
