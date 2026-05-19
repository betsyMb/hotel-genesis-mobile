import { TouchableOpacity, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { MaterialIcons } from "@expo/vector-icons";
import { Occupancy } from "@/hooks/api/types";

interface OccupancyCardProps {
  item: Occupancy;
  onCheckOut: (o: Occupancy) => void;
}

export function OccupancyCard({ item, onCheckOut }: OccupancyCardProps) {
  const checkIn = new Date(item.actual_check_in);
  const checkInStr = checkIn.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const isActive = item.occupancy_status === "active";

  return (
    <View className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden mb-3 border-2 ${
      isActive ? "border-blue-200 dark:border-blue-800" : "border-gray-100 dark:border-gray-700"
    }`}>
      <View className="p-4">
        <View className="flex-row justify-between items-start">
          <View className="flex-row items-center flex-1">
            <View className={`w-12 h-12 rounded-xl items-center justify-center mr-3 ${
              isActive ? "bg-blue-500/20" : "bg-gray-100 dark:bg-gray-700"
            }`}>
              <MaterialIcons name="logout" size={24} color={isActive ? "#3B82F6" : "#94A3B8"} />
            </View>
            <View className="flex-1">
              <ThemedText type="defaultSemiBold">Room {item.id_room}</ThemedText>
              <ThemedText className="text-sm opacity-60">Reservation #{item.id_reservation}</ThemedText>
            </View>
          </View>

          <View className={`px-2.5 py-1 rounded-full ${isActive ? "bg-blue-500/20" : "bg-gray-100 dark:bg-gray-700"}`}>
            <ThemedText className={`text-xs font-semibold ${isActive ? "text-blue-600" : "opacity-60"}`}>
              {isActive ? "Active" : item.occupancy_status}
            </ThemedText>
          </View>
        </View>

        <View className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 mt-3">
          <View className="flex-row justify-between items-center">
            <View className="items-center">
              <ThemedText className="text-xs opacity-60">Check-in</ThemedText>
              <ThemedText className="font-semibold text-sm mt-0.5">{checkInStr}</ThemedText>
            </View>
            <View className="items-center">
              <ThemedText className="text-xs opacity-60">Status</ThemedText>
              <ThemedText className={`font-semibold text-sm mt-0.5 ${isActive ? "text-blue-600" : "opacity-60"}`}>
                {isActive ? "Occupied" : item.occupancy_status}
              </ThemedText>
            </View>
          </View>
        </View>

        {item.guest_signature && (
          <View className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <ThemedText className="text-xs opacity-60">Signed by: {item.guest_signature}</ThemedText>
          </View>
        )}

        {isActive && (
          <TouchableOpacity className="mt-4 py-3 rounded-xl items-center bg-blue-500" onPress={() => onCheckOut(item)}>
            <ThemedText className="text-white font-semibold">Check Out</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
