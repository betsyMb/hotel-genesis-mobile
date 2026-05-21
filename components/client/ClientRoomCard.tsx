import { TouchableOpacity, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { MaterialIcons } from "@expo/vector-icons";
import { Room } from "@/hooks/api/types";

interface ClientRoomCardProps {
  item: Room;
  onPress?: () => void;
}

export function ClientRoomCard({ item, onPress }: ClientRoomCardProps) {
  const isAvailable = item.room_status === "available";

  const statusColors: Record<string, string> = {
    available: "bg-green-500/20 text-green-600",
    occupied: "bg-red-500/20 text-red-500",
    maintenance: "bg-amber-500/20 text-amber-600",
    reserved: "bg-purple-500/20 text-purple-600",
  };

  const statusIcon: Record<string, string> = {
    available: "check-circle",
    occupied: "block",
    maintenance: "build",
    reserved: "event-busy",
  };

  const statusClass = statusColors[item.room_status] || "bg-gray-500/20 text-gray-600";

  return (
    <TouchableOpacity
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden mb-3 border border-gray-100 dark:border-gray-700"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="p-4">
        <View className="flex-row justify-between items-start">
          <View className="flex-row items-center">
            <View className="w-14 h-14 rounded-2xl bg-[#0EA5E9]/10 items-center justify-center mr-3">
              <MaterialIcons name="meeting-room" size={28} color="#0EA5E9" />
            </View>
            <View>
              <ThemedText type="defaultSemiBold" className="text-lg">Room {item.room_number}</ThemedText>
              <View className="flex-row items-center gap-1.5 mt-0.5">
                <MaterialIcons name="king-bed" size={14} color="#9CA3AF" />
                <ThemedText className="text-sm opacity-60 capitalize">{item.room_type}</ThemedText>
                <View className="w-1 h-1 rounded-full bg-gray-300" />
                <MaterialIcons name="floor" size={14} color="#9CA3AF" />
                <ThemedText className="text-sm opacity-60">Floor {item.floor}</ThemedText>
              </View>
            </View>
          </View>

          <View className={`px-2.5 py-1 rounded-full flex-row items-center gap-1 ${statusClass.split(" ")[0]}`}>
            <MaterialIcons name={statusIcon[item.room_status] as any} size={12} color={item.room_status === "available" ? "#10B981" : "#EF4444"} />
            <ThemedText className={`text-xs font-semibold capitalize ${statusClass.split(" ")[1]}`}>
              {item.room_status === "available" ? "Free" : item.room_status}
            </ThemedText>
          </View>
        </View>

        <View className="flex-row items-center mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
          <View className="flex-1 flex-row items-center gap-1">
            <MaterialIcons name="people" size={16} color="#9CA3AF" />
            <ThemedText className="text-sm opacity-60">{item.capacity || "—"} guests</ThemedText>
          </View>
          <View className="flex-row items-center gap-1">
            <MaterialIcons name="attach-money" size={16} color="#0EA5E9" />
            <ThemedText className="text-base font-bold text-[#0EA5E9]">
              ${item.price_per_night}
              <ThemedText className="text-sm font-normal opacity-60">/night</ThemedText>
            </ThemedText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
