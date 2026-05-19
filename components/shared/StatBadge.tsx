import { View } from "react-native";
import { ThemedText } from "@/components/ThemedText";

interface StatBadgeProps {
  label: string;
  value: number | string;
  color: string;
  prefix?: string;
}

export function StatBadge({ label, value, color, prefix }: StatBadgeProps) {
  return (
    <View className="flex-1 items-center py-2 px-1 rounded-xl bg-gray-50 dark:bg-gray-800">
      <ThemedText className="text-lg font-bold" style={{ color }}>
        {prefix}{value}
      </ThemedText>
      <ThemedText className="text-xs opacity-60">{label}</ThemedText>
    </View>
  );
}
