import { useState, useEffect } from "react";
import { FlatList, TouchableOpacity, View, Alert, ActivityIndicator, ScrollView, TextInput, Platform } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuth, useReservations, useRooms, useCreateReservation, useUpdateReservation, useUpdateUser, useExchangeRate } from "@/hooks";
import { ClientRoomCard } from "@/components/client/ClientRoomCard";
import { ClientReservationCard } from "@/components/client/ClientReservationCard";
import { EmptyState, StatBadge } from "@/components/shared";
import { GuestFormRow } from "@/components/walkin";
import { MaterialIcons } from "@expo/vector-icons";
import { Reservation, Room } from "@/hooks/api/types";
import { WalkInGuest } from "@/hooks/api/walkin-types";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

function toLocalDateISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseDate(str: string): Date {
  const [y, m, d] = str.split("T")[0].split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(d: Date): string {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatTime(d: Date): string {
  const hours = String(d.getHours()).padStart(2, "0");
  const mins = String(d.getMinutes()).padStart(2, "0");
  return `${hours}:${mins}`;
}

export default function BookingScreen() {
  const { user } = useAuth();
  const { data: reservations, isLoading, refetch } = useReservations();
  const { data: rooms } = useRooms();
  const { data: exchangeRate } = useExchangeRate();
  const createReservation = useCreateReservation();
  const updateReservation = useUpdateReservation();
  const updateUser = useUpdateUser();

  const [showForm, setShowForm] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [checkIn, setCheckIn] = useState(new Date());
  const [checkOut, setCheckOut] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  });
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [guests, setGuests] = useState("1");
  const [notes, setNotes] = useState("");
  const [name, setName] = useState(user?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [dni, setDni] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [additionalGuests, setAdditionalGuests] = useState<WalkInGuest[]>([]);
  const [filter, setFilter] = useState<string>("all");

  const myReservations = reservations
    ?.filter((r: Reservation) => Number(r.id_client) === Number(user?.id_user))
    .sort((a: Reservation, b: Reservation) =>
      new Date(b.check_in_date).getTime() - new Date(a.check_in_date).getTime()
    ) || [];

  const pendingCount = myReservations.filter((r) => r.reservation_status === "pending").length;
  const completedCount = myReservations.filter((r) => r.reservation_status === "completed").length;
  const cancelledCount = myReservations.filter((r) => r.reservation_status === "cancelled").length;

  const filteredReservations = filter === "all"
    ? myReservations
    : myReservations.filter((r) => r.reservation_status === filter);

  async function handleCreateReservation() {
    if (!selectedRoom) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }
    if (!checkIn || !checkOut) {
      Alert.alert("Error", "Selecciona entrada y salida");
      return;
    }
    if (!editingReservation && !dni.trim()) {
      Alert.alert("Error", "DNI is required");
      return;
    }

    const nights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (nights <= 0) {
      Alert.alert("Error", "Check-out must be after check-in");
      return;
    }

    setSubmitting(true);

    try {
      const totalGuests = Number(guests) + additionalGuests.length;

      const usdAmount = selectedRoom.price_per_night * nights;

      if (editingReservation) {
        await updateReservation.mutateAsync({
          id: editingReservation.id_reservation,
          data: {
            id_room: selectedRoom.id_room,
            check_in_date: toLocalDateISO(checkIn),
            check_out_date: toLocalDateISO(checkOut),
            number_of_guests: totalGuests || 1,
            total_amount: usdAmount,
            notes: notes || undefined,
          },
        });
      } else {
        const checkInStr = toLocalDateISO(checkIn);
        const checkOutStr = toLocalDateISO(checkOut);
        console.log({
          id_client: Number(user!.id_user),
          id_room: selectedRoom.id_room,
          check_in_date: checkInStr,
          check_out_date: checkOutStr,
          number_of_guests: totalGuests || 1,
          reservation_status: "pending",
          total_amount: usdAmount,
          notes: notes || undefined,
        })
        await createReservation.mutateAsync({
          id_client: Number(user!.id_user),
          id_room: selectedRoom.id_room,
          check_in_date: checkInStr,
          check_out_date: checkOutStr,
          number_of_guests: totalGuests || 1,
          reservation_status: "pending",
          total_amount: usdAmount,
          notes: notes || undefined,
        });
      }

      setShowForm(false);
      setEditingReservation(null);
      setSelectedRoom(null);
      setCheckIn(new Date());
      const nextDay = new Date();
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOut(nextDay);
      setGuests("1");
      setNotes("");
      setDni("");
      setAdditionalGuests([]);
      refetch();
      Alert.alert("Éxito", editingReservation ? "¡Reserva actualizada!" : "¡Reserva creada!");

      if (!editingReservation) {
        const updateData: any = {};
        if (name !== user?.full_name) updateData.full_name = name;
        if (email !== user?.email) updateData.email = email;
        if (phone !== user?.phone) updateData.phone = phone;
        if (dni) updateData.dni = dni;
        if (Object.keys(updateData).length > 0) {
          try {
            await updateUser.mutateAsync({ id: Number(user!.id_user), data: updateData });
          } catch {
            // Silencioso
          }
        }
      }
    } catch (err: any) {
      const msg = err.message || "";
      if (msg.includes("PENDIENTE")) {
        Alert.alert(
          "Conflicto de fechas",
          "Ya existe una reserva pendiente para esta habitación en esas fechas. Por favor comuníquese con el hotel al 2-222222 para coordinar o elija otra fecha.",
        );
      } else if (msg.includes("CONFIRMADA")) {
        Alert.alert(
          "Habitación no disponible",
          "La habitación ya está reservada para esas fechas. Seleccione otra habitación o fechas.",
        );
      } else {
        Alert.alert("Error", msg);
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancelReservation(r: Reservation) {
    Alert.alert(
      "Cancelar reserva",
      "¿Estás seguro de que deseas cancelar esta reserva?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: async () => {
            try {
              await updateReservation.mutateAsync({
                id: r.id_reservation,
                data: { reservation_status: "cancelled" },
              });
              refetch();
            } catch (err: any) {
              Alert.alert("Error", err.message);
            }
          },
        },
      ]
    );
  }

  function handleEditReservation(r: Reservation) {
    setEditingReservation(r);
    setSelectedRoom(r.room || null);
    setCheckIn(parseDate(r.check_in_date));
    setCheckOut(parseDate(r.check_out_date));
    setGuests(String(r.number_of_guests || 1));
    setNotes(r.notes || "");
    setShowForm(true);
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
    const nights = checkIn && checkOut
      ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    const estimatedTotal = selectedRoom && nights > 0 ? selectedRoom.price_per_night * nights : null;

    const availableRooms = (rooms?.filter((r) => r.room_status === "available") || []) as Room[];

    return (
      <ThemedView className="flex-1 relative">
        <View className="px-5 py-4 flex-row items-center border-b border-gray-100 dark:border-gray-800">
          <TouchableOpacity onPress={() => { setShowForm(false); setEditingReservation(null); }} className="mr-4">
            <MaterialIcons name="arrow-back" size={24} color="#334155" />
          </TouchableOpacity>
          <ThemedText type="title">{editingReservation ? "Editar Reserva" : "Nueva Reserva"}</ThemedText>
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
                  <ThemedText className="text-xs opacity-60">{selectedRoom.room_type} - {exchangeRate ? `Bs. ${(selectedRoom.price_per_night * exchangeRate).toLocaleString("es-ES", { maximumFractionDigits: 2 })}` : `$${selectedRoom.price_per_night}`} Por noche</ThemedText>
                </View>
              </View>
              <MaterialIcons name="close" size={22} color="#EF4444" />
            </TouchableOpacity>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              <View className="flex-row gap-3">
                {availableRooms.map((room) => (
                    <TouchableOpacity key={room.id_room} onPress={() => setSelectedRoom(room)}>
                    <ClientRoomCard item={room} onPress={() => setSelectedRoom(room)} exchangeRate={exchangeRate} />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}

          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <ThemedText className="font-semibold text-sm opacity-60 mb-1.5">ENTRADA *</ThemedText>
              <TouchableOpacity
                onPress={() => setShowCheckInPicker(true)}
                className="py-2 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
              >
                <View className="flex-row items-center mb-0.5">
                  <MaterialIcons name="calendar-today" size={14} color="#94A3B8" style={{ marginRight: 6 }} />
                  <ThemedText className="text-sm">{formatDate(checkIn)}</ThemedText>
                </View>
                <View className="flex-row items-center">
                  <MaterialIcons name="access-time" size={14} color="#94A3B8" style={{ marginRight: 6 }} />
                  <ThemedText className="text-xs opacity-70">{formatTime(checkIn)}</ThemedText>
                </View>
              </TouchableOpacity>
            </View>
            <View className="flex-1">
              <ThemedText className="font-semibold text-sm opacity-60 mb-1.5">SALIDA *</ThemedText>
              <TouchableOpacity
                onPress={() => setShowCheckOutPicker(true)}
                className="py-2 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
              >
                <View className="flex-row items-center mb-0.5">
                  <MaterialIcons name="calendar-today" size={14} color="#94A3B8" style={{ marginRight: 6 }} />
                  <ThemedText className="text-sm">{formatDate(checkOut)}</ThemedText>
                </View>
                <View className="flex-row items-center">
                  <MaterialIcons name="access-time" size={14} color="#94A3B8" style={{ marginRight: 6 }} />
                  <ThemedText className="text-xs opacity-70">{formatTime(checkOut)}</ThemedText>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {!editingReservation && (
          <View className="mb-4">
            <ThemedText className="font-semibold text-sm opacity-60 mb-1.5 uppercase">Tu Información</ThemedText>
            <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <TextInput
                className="text-sm dark:text-white py-3 px-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl mb-2"
                placeholder="Nombre completo *"
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
              <TextInput
                className="text-sm dark:text-white py-3 px-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl mb-2"
                placeholder="Correo electrónico *"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                className="text-sm dark:text-white py-3 px-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl mb-2"
                placeholder="Teléfono"
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
          )}

          <View className="mb-4">
            <ThemedText className="font-semibold text-sm opacity-60 mb-1.5 uppercase">Huéspedes</ThemedText>
            <TextInput
              value={guests}
              onChangeText={setGuests}
              placeholder="1"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              className="text-sm dark:text-white py-3 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
            />
          </View>

          {!editingReservation && (
          <View className="mb-4">
            <View className="flex-row justify-between items-center mb-2">
              <ThemedText className="font-semibold text-sm opacity-60 uppercase">Huéspedes Adicionales</ThemedText>
              <TouchableOpacity className="flex-row items-center" onPress={addGuestRow}>
                <MaterialIcons name="person-add" size={18} color="#0EA5E9" />
                <ThemedText className="ml-1 text-[#0EA5E9] text-sm font-semibold">Añadir</ThemedText>
              </TouchableOpacity>
            </View>
            {additionalGuests.map((g, i) => (
              <GuestFormRow key={i} guest={g} index={i} onChange={updateGuest} onRemove={removeGuest} />
            ))}
            {additionalGuests.length === 0 && (
              <ThemedText className="text-xs opacity-50 italic">Sin huéspedes adicionales</ThemedText>
            )}
          </View>
          )}

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
                  <ThemedText className="text-sm opacity-60">Estimado</ThemedText>
                  <ThemedText className="text-sm opacity-60">
                    {nights} {nights === 1 ? "noche" : "noches"} × {exchangeRate ? `Bs. ${(selectedRoom!.price_per_night * exchangeRate).toLocaleString("es-ES", { maximumFractionDigits: 2 })}` : `$${selectedRoom!.price_per_night}`}
                  </ThemedText>
                </View>
                <ThemedText className="text-2xl font-bold text-[#0EA5E9]">
                  {exchangeRate ? `Bs. ${(estimatedTotal * exchangeRate).toLocaleString("es-ES", { maximumFractionDigits: 2 })}` : `$${estimatedTotal}`}
                </ThemedText>
              </View>
            </View>
          )}

          <TouchableOpacity
            className="bg-[#0EA5E9] py-4 rounded-xl items-center disabled:opacity-50"
            onPress={handleCreateReservation}
            disabled={submitting || !selectedRoom || !checkIn || !checkOut || (!editingReservation && !dni.trim())}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <ThemedText className="text-white font-semibold text-base">
                {editingReservation ? "Actualizar Reserva" : "Crear Reserva"}
              </ThemedText>
            )}
          </TouchableOpacity>
        </ScrollView>

        {showCheckInPicker && (
          <DatePickerOverlay
            date={checkIn}
            onChange={setCheckIn}
            onClose={() => setShowCheckInPicker(false)}
          />
        )}
        {showCheckOutPicker && (
          <DatePickerOverlay
            date={checkOut}
            onChange={setCheckOut}
            onClose={() => setShowCheckOutPicker(false)}
          />
        )}
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1">
      <ThemedView className="px-5 py-4 flex-row justify-between items-center border-b border-gray-100 dark:border-gray-800">
        <View>
          <ThemedText type="title">Mis Reservas</ThemedText>
          <ThemedText className="opacity-60 mt-0.5">
            {myReservations.length} {myReservations.length === 1 ? "reserva" : "reservas"}
          </ThemedText>
        </View>
        <TouchableOpacity
          className="flex-row items-center bg-[#0EA5E9] px-4 py-2.5 rounded-xl"
          onPress={() => setShowForm(true)}
        >
          <MaterialIcons name="add" size={20} color="white" />
          <ThemedText className="text-white font-semibold ml-1">Nueva</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <View className="px-5 py-2 border-b border-gray-100 dark:border-gray-800">
        <View className="flex-row gap-2">
          <StatBadge label="Total" value={myReservations.length} color="#0EA5E9" />
          <StatBadge label="Pendiente" value={pendingCount} color="#F59E0B" />
          <StatBadge label="Cancelada" value={cancelledCount} color="#EF4444" />
        </View>
        <View className="flex-row bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mt-2">
          {["all", "pending", "cancelled"].map((f) => {
            const labels: Record<string, string> = { all: "Todas", pending: "Pendientes", cancelled: "Canceladas" };
            return (
              <TouchableOpacity
                key={f}
                className={`flex-1 py-2 rounded-lg items-center ${filter === f ? "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600" : ""}`}
                onPress={() => setFilter(f)}
              >
                <ThemedText className={`text-xs font-semibold ${filter === f ? "text-[#0EA5E9]" : "opacity-60"}`}>
                  {labels[f]}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {isLoading && (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0EA5E9" />
          <ThemedText className="mt-4 opacity-60">Cargando reservas...</ThemedText>
        </View>
      )}

      {!isLoading && myReservations.length === 0 && (
        <EmptyState icon="event-note" title="No hay reservas aún" subtitle="Toca + Nueva para reservar tu primera habitación" />
      )}

      {!isLoading && myReservations.length > 0 && filteredReservations.length === 0 && (
        <EmptyState icon="search" title="Sin resultados" subtitle={`No hay reservas con el filtro seleccionado`} />
      )}

      {!isLoading && filteredReservations.length > 0 && (
        <FlatList
          data={filteredReservations}
          keyExtractor={(item) => item.id_reservation.toString()}
          className="flex-1"
          renderItem={({ item }) => (
            <ClientReservationCard
              item={item as Reservation}
              onEdit={() => handleEditReservation(item as Reservation)}
              onCancel={() => handleCancelReservation(item as Reservation)}
              exchangeRate={exchangeRate}
            />
          )}
          contentContainerClassName="px-4 py-4"
        />
      )}
    </ThemedView>
  );
}

function DatePickerOverlay({ date, onChange, onClose }: {
  date: Date;
  onChange: (d: Date) => void;
  onClose: () => void;
}) {
  const [currentDate, setCurrentDate] = useState(date);
  const [step, setStep] = useState<'date' | 'time'>('date');

  useEffect(() => { setCurrentDate(date); }, [date]);

  function handleChange(event: DateTimePickerEvent, selectedDate?: Date) {
    if (Platform.OS === 'android') {
      if (event.type === 'dismissed') {
        onClose();
        return;
      }
      if (step === 'date') {
        setCurrentDate(selectedDate || currentDate);
        setStep('time');
      } else {
        const updated = new Date(currentDate);
        if (selectedDate) {
          updated.setHours(selectedDate.getHours());
          updated.setMinutes(selectedDate.getMinutes());
        }
        onChange(updated);
        onClose();
        setStep('date');
      }
    } else {
      if (selectedDate) {
        setCurrentDate(selectedDate);
        onChange(selectedDate);
      }
    }
  }

  function handleDone() {
    if (Platform.OS === 'android') return;
    onChange(currentDate);
    onClose();
  }

  if (Platform.OS === 'android') {
    return (
      <DateTimePicker
        value={currentDate}
        mode={step === 'time' ? 'time' : 'date'}
        onChange={handleChange}
      />
    );
  }

  return (
    <View className="absolute inset-0 z-50 justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <TouchableOpacity className="absolute inset-0" activeOpacity={1} onPress={onClose} />
      <View className="mx-6 bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
        <View className="flex-row justify-between items-center px-5 pt-4 pb-2">
          <TouchableOpacity onPress={onClose}>
            <ThemedText className="text-red-500 font-semibold">Cancelar</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDone}>
            <ThemedText className="text-[#0EA5E9] font-semibold">OK</ThemedText>
          </TouchableOpacity>
        </View>
        <DateTimePicker
          value={currentDate}
          mode="datetime"
          display="spinner"
          onChange={handleChange}
          locale="es-ES"
        />
      </View>
    </View>
  );
}
