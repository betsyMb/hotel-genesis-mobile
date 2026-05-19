import { TouchableOpacity, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { MaterialIcons } from "@expo/vector-icons";
import { User } from "@/hooks/api/types";

const roleIcons: Record<string, string> = {
  Administrator: "admin-panel-settings",
  Manager: "work",
  Receptionist: "reorder",
  Client: "person",
  Maintenance: "build",
};

const roleColors: Record<string, string> = {
  Administrator: "#EF4444",
  Manager: "#F59E0B",
  Receptionist: "#3B82F6",
  Client: "#10B981",
  Maintenance: "#6B7280",
};

interface UserCardProps {
  item: User;
  onEdit?: (user: User) => void;
  onDelete?: (id: number) => void;
}

export function UserCard({ item, onEdit, onDelete }: UserCardProps) {
  const roleColor = roleColors[item.role] || "#6B7280";
  const roleIcon = roleIcons[item.role] || "person";

  return (
    <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden mb-3">
      <View className="p-4">
        <View className="flex-row items-center">
          <View className="w-14 h-14 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: `${roleColor}15` }}>
            <MaterialIcons name={roleIcon as any} size={26} color={roleColor} />
          </View>

          <View className="flex-1">
            <ThemedText type="defaultSemiBold">{item.full_name}</ThemedText>
            <ThemedText className="text-sm opacity-60">{item.email}</ThemedText>
            <View className="flex-row items-center mt-1">
              <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: `${roleColor}15` }}>
                <ThemedText className="text-xs font-semibold" style={{ color: roleColor }}>{item.role}</ThemedText>
              </View>
              <View className={`w-2 h-2 rounded-full ml-2 ${item.is_active ? "bg-green-500" : "bg-gray-400"}`} />
              <ThemedText className="ml-1 text-xs opacity-60">{item.is_active ? "Active" : "Inactive"}</ThemedText>
            </View>
          </View>
        </View>

        {(onEdit || onDelete) && (
          <View className="flex-row justify-end mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
            {onEdit && (
              <TouchableOpacity className="flex-row items-center px-3 py-1.5 mr-2" onPress={() => onEdit(item)}>
                <MaterialIcons name="edit" size={16} color="#3B82F6" />
                <ThemedText className="ml-1 text-xs font-semibold text-blue-500">Edit</ThemedText>
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity className="flex-row items-center px-3 py-1.5" onPress={() => onDelete(item.id_user)}>
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
