import { TouchableOpacity, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { MaterialIcons } from "@expo/vector-icons";
import { Room } from "@/hooks/api/types";

interface ClientRoomCardProps {
  item: Room;
  onPress?: () => void;
}

export function ClientRoomCard({ item, onPress }: ClientRoomCardProps) {
  const status = item.room_status === "available";

  return (
    <TouchableOpacity
      className={`w-52 bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 ${onPress ? "active:opacity-80" : ""}`}
      onPress={onPress}
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="w-10 h-10 rounded-xl bg-[#0EA5E9]/10 items-center justify-center">
          <MaterialIcons name="hotel" size={22} color="#0EA5E9" />
        </View>
        {status && (
          <View className="bg-green-500/10 px-2 py-0.5 rounded-full">
            <ThemedText className="text-green-600 text-xs font-semibold">Free</ThemedText>
          </View>
        )}
      </View>
      <ThemedText className="text-sm opacity-60">
        {item.room_type.charAt(0).toUpperCase() + item.room_type.slice(1)}
      </ThemedText>
      <ThemedText className="text-lg font-bold text-[#0EA5E9] mt-1">
        ${item.price_per_night}
        <ThemedText className="text-sm font-normal opacity-60">/night</ThemedText>
      </ThemedText>
    </TouchableOpacity>
  );
}
