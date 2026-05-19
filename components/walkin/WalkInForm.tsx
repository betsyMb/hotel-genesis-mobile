import { useState } from "react";
import {
  ScrollView, TouchableOpacity, View, Alert, TextInput, Modal, FlatList,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { MaterialIcons } from "@expo/vector-icons";
import { useRooms, useUsers, useWalkinCheckin } from "@/hooks";
import { Room, User } from "@/hooks/api/types";
import { WalkInGuest } from "@/hooks/api/walkin-types";
import { GuestFormRow } from "./GuestFormRow";
import { NewUserModal } from "./NewUserModal";

interface WalkInFormProps {
  onSuccess?: () => void;
}

export function WalkInForm({ onSuccess }: WalkInFormProps) {
  const { data: rooms } = useRooms();
  const { data: users } = useUsers();
  const walkinCheckin = useWalkinCheckin();

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showRoomPicker, setShowRoomPicker] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [showNewUserModal, setShowNewUserModal] = useState(false);

  const [mainFirstName, setMainFirstName] = useState("");
  const [mainLastName, setMainLastName] = useState("");
  const [mainDni, setMainDni] = useState("");
  const [mainPhone, setMainPhone] = useState("");

  const [guests, setGuests] = useState<WalkInGuest[]>([{ first_name: "", last_name: "", dni: "", phone_number: "" }]);
  const [submitting, setSubmitting] = useState(false);

  const availableRooms = rooms?.filter((r) => r.room_status === "available") || [];

  function handleGuestChange(index: number, field: keyof WalkInGuest, value: string) {
    setGuests((prev) =>
      prev.map((g, i) => (i === index ? { ...g, [field]: value } : g))
    );
  }

  function addGuestRow() {
    setGuests((prev) => [...prev, { first_name: "", last_name: "", dni: "", phone_number: "" }]);
  }

  function removeGuestRow(index: number) {
    setGuests((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (!selectedRoom) {
      Alert.alert("Error", "Please select a room");
      return;
    }
    if (!mainFirstName.trim() || !mainLastName.trim()) {
      Alert.alert("Error", "Enter the main guest's first and last name");
      return;
    }

    setSubmitting(true);

    try {
      await walkinCheckin.mutateAsync({
        room_id: selectedRoom.id_room,
        guest: {
          first_name: mainFirstName.trim(),
          last_name: mainLastName.trim(),
          dni: mainDni.trim() || "",
          phone_number: mainPhone.trim() || undefined,
        },
        additional_guests: guests
          .filter((g) => g.first_name.trim())
          .map((g) => ({
            first_name: g.first_name.trim(),
            last_name: g.last_name.trim(),
            dni: g.dni.trim() || "",
          })),
      });

      Alert.alert("Success", `Checked in to Room ${selectedRoom.room_number}`);

      setSelectedRoom(null);
      setSelectedUser(null);
      setMainFirstName("");
      setMainLastName("");
      setMainDni("");
      setMainPhone("");
      setGuests([{ first_name: "", last_name: "", dni: "", phone_number: "" }]);
      onSuccess?.();
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ThemedView className="flex-1">
      <ScrollView contentContainerClassName="p-5">
        <View className="mb-6">
          <ThemedText className="font-semibold text-sm opacity-60 mb-2 uppercase">
            Select Room *
          </ThemedText>

          <TouchableOpacity
            className="flex-row items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5"
            onPress={() => setShowRoomPicker(true)}
          >
            <View className="flex-row items-center flex-1">
              <MaterialIcons name="hotel" size={20} color="#94A3B8" style={{ marginRight: 10 }} />
              {selectedRoom ? (
                <View>
                  <ThemedText className="font-semibold">Room {selectedRoom.room_number}</ThemedText>
                  <ThemedText className="text-xs opacity-60">
                    {selectedRoom.room_type} - ${selectedRoom.price_per_night}/night
                  </ThemedText>
                </View>
              ) : (
                <ThemedText className="opacity-50">Tap to select a room</ThemedText>
              )}
            </View>
            <MaterialIcons name="expand-more" size={22} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <View className="mb-6">
          <ThemedText className="font-semibold text-sm opacity-60 mb-2 uppercase">
            Main Guest *
          </ThemedText>

          <View className="flex-row gap-2 mb-2">
            <View className="flex-1">
              <TextInput
                className="text-sm dark:text-white py-3 px-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                placeholder="First name"
                placeholderTextColor="#94A3B8"
                value={mainFirstName}
                onChangeText={setMainFirstName}
                autoCapitalize="words"
              />
            </View>
            <View className="flex-1">
              <TextInput
                className="text-sm dark:text-white py-3 px-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                placeholder="Last name"
                placeholderTextColor="#94A3B8"
                value={mainLastName}
                onChangeText={setMainLastName}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View className="flex-row gap-2 mb-3">
            <View className="flex-1">
              <TextInput
                className="text-sm dark:text-white py-3 px-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                placeholder="DNI"
                placeholderTextColor="#94A3B8"
                value={mainDni}
                onChangeText={setMainDni}
                autoCapitalize="characters"
              />
            </View>
            <View className="flex-1">
              <TextInput
                className="text-sm dark:text-white py-3 px-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                placeholder="Phone"
                placeholderTextColor="#94A3B8"
                value={mainPhone}
                onChangeText={setMainPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <TouchableOpacity
            className="flex-row items-center py-2"
            onPress={() => setShowUserPicker(true)}
          >
            <View className="w-8 h-8 rounded-lg bg-[#6366F1]/10 items-center justify-center mr-2">
              <MaterialIcons name="person-search" size={18} color="#6366F1" />
            </View>
            <ThemedText className="text-[#6366F1] font-semibold">Search existing guest</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center py-1"
            onPress={() => setShowNewUserModal(true)}
          >
            <View className="w-8 h-8 rounded-lg bg-[#0EA5E9]/10 items-center justify-center mr-2">
              <MaterialIcons name="person-add" size={18} color="#0EA5E9" />
            </View>
            <ThemedText className="text-[#0EA5E9] font-semibold">New guest not registered</ThemedText>
          </TouchableOpacity>
        </View>

        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-2">
            <ThemedText className="font-semibold text-sm opacity-60 uppercase">
              Room Guests
            </ThemedText>
            <TouchableOpacity className="flex-row items-center" onPress={addGuestRow}>
              <MaterialIcons name="add" size={18} color="#0EA5E9" />
              <ThemedText className="ml-1 text-[#0EA5E9] text-sm font-semibold">Add</ThemedText>
            </TouchableOpacity>
          </View>

          {guests.map((guest, i) => (
            <GuestFormRow
              key={i}
              guest={guest}
              index={i}
              onChange={handleGuestChange}
              onRemove={removeGuestRow}
            />
          ))}
        </View>

            <TouchableOpacity
              className="bg-[#0EA5E9] py-4 rounded-xl items-center disabled:opacity-50"
              onPress={handleSubmit}
              disabled={submitting || walkinCheckin.isPending}
            >
              <ThemedText className="text-white font-semibold text-base">
                {submitting || walkinCheckin.isPending ? "Processing..." : "Check In"}
              </ThemedText>
            </TouchableOpacity>
      </ScrollView>

      <NewUserModal
        visible={showNewUserModal}
        onClose={() => setShowNewUserModal(false)}
        onSave={(data) => {
          setMainFirstName(data.first_name);
          setMainLastName(data.last_name);
          setMainDni(data.dni);
          setMainPhone(data.phone_number);
          setSelectedUser(null);
          setShowNewUserModal(false);
        }}
      />

      <Modal visible={showRoomPicker} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white dark:bg-gray-900 rounded-t-3xl p-6 max-h-[60%]">
            <View className="flex-row justify-between items-center mb-4">
              <ThemedText type="title">Select Room</ThemedText>
              <TouchableOpacity onPress={() => setShowRoomPicker(false)}>
                <MaterialIcons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {availableRooms.length === 0 ? (
              <ThemedText className="opacity-60 italic text-center py-8">No available rooms</ThemedText>
            ) : (
              <FlatList
                data={availableRooms}
                keyExtractor={(item) => item.id_room.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className={`flex-row items-center p-4 rounded-xl mb-2 border ${
                      selectedRoom?.id_room === item.id_room
                        ? "border-[#0EA5E9] bg-[#0EA5E9]/5"
                        : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                    }`}
                    onPress={() => {
                      setSelectedRoom(item);
                      setShowRoomPicker(false);
                    }}
                  >
                    <View className="w-10 h-10 rounded-lg bg-[#0EA5E9]/10 items-center justify-center mr-3">
                      <MaterialIcons name="hotel" size={22} color="#0EA5E9" />
                    </View>
                    <View className="flex-1">
                      <ThemedText className="font-semibold">Room {item.room_number}</ThemedText>
                      <ThemedText className="text-xs opacity-60">
                        {item.room_type} - ${item.price_per_night}/night - Floor {item.floor}
                      </ThemedText>
                    </View>
                    {selectedRoom?.id_room === item.id_room && (
                      <MaterialIcons name="check-circle" size={22} color="#0EA5E9" />
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={showUserPicker} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white dark:bg-gray-900 rounded-t-3xl p-6 max-h-[70%]">
            <View className="flex-row justify-between items-center mb-4">
              <ThemedText type="title">Select Guest</ThemedText>
              <TouchableOpacity onPress={() => { setShowUserPicker(false); setUserSearch(""); }}>
                <MaterialIcons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <TextInput
              className="text-sm dark:text-white py-3 px-4 bg-gray-100 dark:bg-gray-800 rounded-xl mb-4"
              placeholder="Search by name or email..."
              placeholderTextColor="#94A3B8"
              value={userSearch}
              onChangeText={setUserSearch}
              autoCapitalize="none"
            />

            {(() => {
              const filtered = (users || [])
                .filter((u) => u.role === "Client")
                .filter((u) =>
                  !userSearch.trim() ||
                  u.full_name.toLowerCase().includes(userSearch.toLowerCase()) ||
                  u.email.toLowerCase().includes(userSearch.toLowerCase())
                );

              return filtered.length === 0 ? (
                <ThemedText className="opacity-60 italic text-center py-8">No users found</ThemedText>
              ) : (
                <FlatList
                  data={filtered}
                  keyExtractor={(item) => item.id_user.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      className={`flex-row items-center p-4 rounded-xl mb-2 border ${
                        selectedUser?.id_user === item.id_user
                          ? "border-[#0EA5E9] bg-[#0EA5E9]/5"
                          : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                      }`}
                      onPress={() => {
                        setSelectedUser(item);
                        const names = item.full_name.trim().split(/\s+/);
                        setMainFirstName(names[0] || "");
                        setMainLastName(names.slice(1).join(" ") || "");
                        setMainDni("");
                        setMainPhone(item.phone || "");
                        setUserSearch("");
                        setShowUserPicker(false);
                      }}
                    >
                      <View className="w-10 h-10 rounded-lg bg-[#0EA5E9]/10 items-center justify-center mr-3">
                        <MaterialIcons name="person" size={22} color="#0EA5E9" />
                      </View>
                      <View className="flex-1">
                        <ThemedText className="font-semibold">{item.full_name}</ThemedText>
                        <ThemedText className="text-xs opacity-60">{item.email}</ThemedText>
                      </View>
                      {selectedUser?.id_user === item.id_user && (
                        <MaterialIcons name="check-circle" size={22} color="#0EA5E9" />
                      )}
                    </TouchableOpacity>
                  )}
                />
              );
            })()}
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}
