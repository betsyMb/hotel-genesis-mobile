import { TouchableOpacity, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { MaterialIcons } from "@expo/vector-icons";
import { Room } from "@/hooks/api/types";

const statusConfig: Record<string, { color: string; icon: string; bg: string; label: string }> = {
  available: { color: "#10B981", icon: "check-circle", bg: "#ECFDF5", label: "Available" },
  occupied: { color: "#EF4444", icon: "cancel", bg: "#FEF2F2", label: "Occupied" },
  maintenance: { color: "#F59E0B", icon: "build", bg: "#FFF7ED", label: "Maintenance" },
  reserved: { color: "#3B82F6", icon: "event", bg: "#EFF6FF", label: "Reserved" },
};

interface RoomCardProps {
  item: Room;
  onEdit?: (room: Room) => void;
  onDelete?: (id: number) => void;
  showActions?: boolean;
}

export function RoomCard({ item, onEdit, onDelete, showActions = true }: RoomCardProps) {
  const status = statusConfig[item.room_status] || statusConfig.available;

  return (
    <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden mb-3">
      <View className="p-4">
        <View className="flex-row justify-between items-start">
          <View className="flex-row items-center flex-1">
            <View className="w-12 h-12 rounded-xl bg-[#0EA5E9]/10 items-center justify-center mr-3">
              <MaterialIcons name="hotel" size={24} color="#0EA5E9" />
            </View>
            <View className="flex-1">
              <ThemedText type="defaultSemiBold">Room {item.room_number}</ThemedText>
              <ThemedText className="text-sm opacity-60">
                {item.room_type.charAt(0).toUpperCase() + item.room_type.slice(1)}
              </ThemedText>
            </View>
          </View>

          <View className="flex-row items-center px-2.5 py-1 rounded-full" style={{ backgroundColor: status.bg }}>
            <MaterialIcons name={status.icon as any} size={12} color={status.color} />
            <ThemedText className="ml-1 text-xs font-semibold" style={{ color: status.color }}>
              {status.label}
            </ThemedText>
          </View>
        </View>

        <View className="flex-row justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
          <View className="flex-row items-center">
            <MaterialIcons name="people" size={16} color="#94A3B8" />
            <ThemedText className="ml-1.5 text-sm opacity-70">{item.capacity || 2}</ThemedText>
          </View>
          <View className="flex-row items-center">
            <MaterialIcons name="layers" size={16} color="#94A3B8" />
            <ThemedText className="ml-1.5 text-sm opacity-70">Floor {item.floor}</ThemedText>
          </View>
          <View className="flex-row items-center">
            <MaterialIcons name="attach-money" size={16} color="#94A3B8" />
            <ThemedText className="ml-1.5 text-sm font-bold text-[#0EA5E9]">${item.price_per_night}</ThemedText>
          </View>
        </View>

        {item.description && (
          <ThemedText className="text-sm opacity-60 mt-3 italic">"{item.description}"</ThemedText>
        )}

        {showActions && (
          <View className="flex-row justify-end mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            {onEdit && (
              <TouchableOpacity className="flex-row items-center px-3 py-1.5 mr-2" onPress={() => onEdit(item)}>
                <MaterialIcons name="edit" size={16} color="#3B82F6" />
                <ThemedText className="ml-1 text-xs font-semibold text-blue-500">Edit</ThemedText>
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity className="flex-row items-center px-3 py-1.5" onPress={() => onDelete(item.id_room)}>
                <MaterialIcons name="delete-outline" size={16} color="#EF4444" />
                <ThemedText className="ml-1 text-xs font-semibold text-red-500">Delete</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

export function getRoomStatusConfig() {
  return statusConfig;
}
