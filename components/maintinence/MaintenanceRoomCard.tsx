import { TouchableOpacity, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { MaterialIcons } from "@expo/vector-icons";
import { Room } from "@/hooks/api/types";

interface MaintenanceRoomCardProps {
  item: Room;
  onToggle: (r: Room) => void;
  showOnlyMaintenance?: boolean;
}

export function MaintenanceRoomCard({ item, onToggle }: MaintenanceRoomCardProps) {
  const isMaintenance = item.room_status === "maintenance";

  return (
    <View className={`rounded-2xl shadow-sm overflow-hidden mb-3 border-2 ${
      isMaintenance ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800" : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700"
    }`}>
      <View className="p-4">
        <View className="flex-row justify-between items-start">
          <View className="flex-row items-center">
            <View className={`w-12 h-12 rounded-xl items-center justify-center mr-3 ${
              isMaintenance ? "bg-amber-500/20" : "bg-gray-100 dark:bg-gray-700"
            }`}>
              <MaterialIcons name="build" size={24} color={isMaintenance ? "#F59E0B" : "#94A3B8"} />
            </View>
            <View>
              <ThemedText type="defaultSemiBold">Room {item.room_number}</ThemedText>
              <ThemedText className="text-sm opacity-60">
                {item.room_type.charAt(0).toUpperCase() + item.room_type.slice(1)}
              </ThemedText>
            </View>
          </View>

          <View className={`px-2.5 py-1 rounded-full ${isMaintenance ? "bg-amber-500/20" : "bg-gray-100 dark:bg-gray-700"}`}>
            <ThemedText className={`text-xs font-semibold ${isMaintenance ? "text-amber-600" : "opacity-60"}`}>
              {isMaintenance ? "Maintenance" : item.room_status}
            </ThemedText>
          </View>
        </View>

        {item.description && (
          <ThemedText className="text-sm opacity-60 mt-3 italic">"{item.description}"</ThemedText>
        )}

        {isMaintenance && (
          <TouchableOpacity className="mt-4 py-3 rounded-xl items-center bg-green-500" onPress={() => onToggle(item)}>
            <ThemedText className="text-white font-semibold">Mark as Available</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
