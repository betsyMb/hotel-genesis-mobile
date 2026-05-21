import { TouchableOpacity, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { MaterialIcons } from "@expo/vector-icons";
import { Reservation } from "@/hooks/api/types";
import { getReservationStatusConfig } from "./ReservationCard";

const statusConfig = getReservationStatusConfig();

interface StatusPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (status: string) => void;
  reservation: Reservation | null;
}

export function StatusPickerModal({ visible, onClose, onConfirm, reservation }: StatusPickerModalProps) {
  if (!visible || !reservation) return null;

  return (
    <View className="absolute inset-0 z-50">
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white dark:bg-gray-900 rounded-t-3xl p-6">
          <View className="flex-row justify-between items-center mb-5">
            <ThemedText type="title">Change Status</ThemedText>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View className="mb-5">
            <ThemedText className="font-semibold">Room {reservation.room?.room_number || reservation.id_room}</ThemedText>
            <ThemedText className="opacity-60">{reservation.client?.full_name || `Client #${reservation.id_client}`}</ThemedText>
          </View>

          <View className="flex-row flex-wrap gap-2 mb-5">
            {Object.entries(statusConfig).map(([key, val]) => (
              <TouchableOpacity
                key={key}
                className={`px-4 py-2.5 rounded-xl flex-row items-center ${
                  reservation.reservation_status === key ? "bg-[#0EA5E9]" : "bg-gray-100 dark:bg-gray-800"
                }`}
                onPress={() => onConfirm(key)}
              >
                <MaterialIcons name={val.icon as any} size={16} color={reservation.reservation_status === key ? "white" : val.color} />
                <ThemedText className={`ml-1.5 text-sm font-semibold ${reservation.reservation_status === key ? "text-white" : ""}`}>
                  {val.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity className="py-4 rounded-xl items-center border border-gray-300" onPress={onClose}>
            <ThemedText className="font-semibold">Cancel</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
