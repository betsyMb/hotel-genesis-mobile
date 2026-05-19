import { TouchableOpacity, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { MaterialIcons } from "@expo/vector-icons";
import { Reservation } from "@/hooks/api/types";

const statusConfig: Record<string, { color: string }> = {
  pending: { color: "#F59E0B" },
  confirmed: { color: "#10B981" },
  cancelled: { color: "#EF4444" },
  completed: { color: "#3B82F6" },
  no_show: { color: "#6B7280" },
};

interface ClientReservationCardProps {
  item: Reservation;
  onPress?: () => void;
}

export function ClientReservationCard({ item, onPress }: ClientReservationCardProps) {
  const status = statusConfig[item.reservation_status] || statusConfig.pending;
  const checkIn = new Date(item.check_in_date);
  const checkOut = new Date(item.check_out_date);

  return (
    <TouchableOpacity
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-3 flex-row items-center"
      onPress={onPress}
    >
      <View className="w-10 h-10 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: `${status.color}15` }}>
        <MaterialIcons name="event-note" size={20} color={status.color} />
      </View>
      <View className="flex-1">
        <ThemedText className="font-semibold">Room {item.room?.room_number || item.id_room}</ThemedText>
        <ThemedText className="text-xs opacity-60">
          {checkIn.toLocaleDateString("en-US", { month: "short", day: "numeric" })} → {checkOut.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </ThemedText>
      </View>
      <View className="items-end">
        <ThemedText className="text-sm font-bold text-[#0EA5E9]">${item.total_amount}</ThemedText>
        <ThemedText className="text-xs font-semibold" style={{ color: status.color }}>
          {item.reservation_status.charAt(0).toUpperCase() + item.reservation_status.slice(1)}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}
