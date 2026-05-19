import { TouchableOpacity, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { MaterialIcons } from "@expo/vector-icons";

interface InfoRowProps {
  icon: string;
  label: string;
  value: string;
  isLast?: boolean;
}

export function InfoRow({ icon, label, value, isLast }: InfoRowProps) {
  return (
    <View className={`flex-row items-center p-4 ${isLast ? "" : "border-b border-gray-100 dark:border-gray-700"}`}>
      <MaterialIcons name={icon as any} size={20} color="#94A3B8" />
      <View className="ml-3 flex-1">
        <ThemedText className="text-xs opacity-60">{label}</ThemedText>
        <ThemedText className="font-semibold">{value}</ThemedText>
      </View>
    </View>
  );
}

interface SettingRowProps {
  icon: string;
  iconColor: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
}

export function SettingRow({ icon, iconColor, title, subtitle, onPress }: SettingRowProps) {
  return (
    <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0" onPress={onPress}>
      <View className="w-10 h-10 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: `${iconColor}15` }}>
        <MaterialIcons name={icon as any} size={22} color={iconColor} />
      </View>
      <View className="flex-1">
        <ThemedText className="font-semibold">{title}</ThemedText>
        <ThemedText className="text-xs opacity-60">{subtitle}</ThemedText>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#CBD5E1" />
    </TouchableOpacity>
  );
}
