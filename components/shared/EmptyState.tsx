import { View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { MaterialIcons } from "@expo/vector-icons";

interface EmptyStateProps {
  icon: string;
  iconColor?: string;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon, iconColor = "#CBD5E1", title, subtitle }: EmptyStateProps) {
  return (
    <View className="justify-center items-center py-12">
      <MaterialIcons name={icon as any} size={48} color={iconColor} />
      <ThemedText className="mt-3 text-center text-lg font-semibold mb-1">{title}</ThemedText>
      {subtitle && <ThemedText className="text-center opacity-60">{subtitle}</ThemedText>}
    </View>
  );
}
