import { useState } from "react";
import { TouchableOpacity, View, Modal } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import { Reservation, Occupancy } from "@/hooks/api/types";
import { MaterialIcons } from "@expo/vector-icons";

interface CheckInConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (signature: string) => void;
  reservation: Reservation | null;
}

export function CheckInConfirmModal({ visible, onClose, onConfirm, reservation }: CheckInConfirmModalProps) {
  const [signature, setSignature] = useState("");

  function handleConfirm() {
    if (!signature.trim()) {
      return;
    }
    onConfirm(signature);
    setSignature("");
  }

  if (!reservation) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white dark:bg-gray-900 rounded-t-3xl p-6">
          <View className="flex-row justify-between items-center mb-5">
            <ThemedText type="title">Confirm Check-In</ThemedText>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 mb-5">
            <View className="flex-row items-center mb-2">
              <MaterialIcons name="hotel" size={20} color="#10B981" />
              <ThemedText className="ml-2 font-semibold">Room {reservation.room?.room_number || reservation.id_room}</ThemedText>
            </View>
            <ThemedText className="opacity-70">{reservation.client?.full_name || `Client #${reservation.id_client}`}</ThemedText>
            <ThemedText className="opacity-70">{reservation.number_of_guests || 1} {reservation.number_of_guests === 1 ? "guest" : "guests"}</ThemedText>
          </View>

          <ThemedText className="font-semibold text-sm opacity-60 mb-1.5">GUEST SIGNATURE *</ThemedText>
          <ThemedTextInput value={signature} onChangeText={setSignature} placeholder="Type guest name as signature" className="bg-gray-50 dark:bg-gray-800 mb-6" />

          <TouchableOpacity className="bg-green-500 py-4 rounded-xl items-center" onPress={handleConfirm}>
            <ThemedText className="text-white font-semibold">Confirm Check-In</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

interface CheckOutConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  occupancy: Occupancy | null;
}

export function CheckOutConfirmModal({ visible, onClose, onConfirm, occupancy }: CheckOutConfirmModalProps) {
  if (!occupancy) return null;

  const checkIn = new Date(occupancy.actual_check_in);
  const now = new Date();
  const nights = Math.max(1, Math.ceil((now.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white dark:bg-gray-900 rounded-t-3xl p-6">
          <View className="flex-row justify-between items-center mb-5">
            <ThemedText type="title">Confirm Check-Out</ThemedText>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-5">
            <View className="flex-row items-center mb-2">
              <MaterialIcons name="hotel" size={20} color="#3B82F6" />
              <ThemedText className="ml-2 font-semibold">Room {occupancy.id_room}</ThemedText>
            </View>
            <ThemedText className="opacity-70">Stayed {nights} {nights === 1 ? "night" : "nights"}</ThemedText>
            <ThemedText className="opacity-70">Signed by: {occupancy.guest_signature || "N/A"}</ThemedText>
          </View>

          <View className="flex-row gap-3">
            <TouchableOpacity className="flex-1 py-4 rounded-xl items-center border border-gray-300" onPress={onClose}>
              <ThemedText className="font-semibold">Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-blue-500 py-4 rounded-xl items-center" onPress={onConfirm}>
              <ThemedText className="text-white font-semibold">Confirm Check-Out</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export const CheckInOutModals = {
  CheckInConfirmModal,
  CheckOutConfirmModal,
};
