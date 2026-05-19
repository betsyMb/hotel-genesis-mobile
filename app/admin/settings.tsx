import { TouchableOpacity, View, ScrollView, Alert } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/hooks";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/use-theme";

export default function AdminSettingsScreen() {
  const router = useRouter();
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <ScrollView className="flex-1">
      <ThemedView className="px-5 pt-4 pb-8">
        <ThemedText type="title" className="mb-1">Settings</ThemedText>
        <ThemedText className="opacity-60 mb-6">Manage your preferences</ThemedText>

        <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden mb-5">
          <SettingHeader label="Appearance" />

          <TouchableOpacity
            className="flex-row items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700"
            onPress={toggleTheme}
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl bg-purple-500/10 items-center justify-center mr-3">
                <MaterialIcons name={resolvedTheme === "dark" ? "light-mode" : "dark-mode"} size={22} color="#8B5CF6" />
              </View>
              <View>
                <ThemedText className="font-semibold">Theme</ThemedText>
                <ThemedText className="text-xs opacity-60 capitalize">{resolvedTheme} mode</ThemedText>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden mb-5">
          <SettingHeader label="Notifications" />

          <SettingRow
            icon="notifications"
            iconColor="#0EA5E9"
            title="Email Notifications"
            subtitle="Receive booking confirmations via email"
          />
          <SettingRow
            icon="sms"
            iconColor="#10B981"
            title="SMS Alerts"
            subtitle="Get notified about room status changes"
          />
          <SettingRow
            icon="campaign"
            iconColor="#F59E0B"
            title="Push Notifications"
            subtitle="Real-time alerts on your device"
          />
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden mb-5">
          <SettingHeader label="System" />

          <SettingRow
            icon="backup"
            iconColor="#3B82F6"
            title="Backup & Restore"
            subtitle="Manage your data backups"
          />
          <SettingRow
            icon="sync"
            iconColor="#8B5CF6"
            title="Sync Data"
            subtitle="Sync with backend server"
          />
          <SettingRow
            icon="delete-sweep"
            iconColor="#EF4444"
            title="Clear Cache"
            subtitle="Free up storage space"
          />
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden mb-5">
          <SettingHeader label="About" />

          <SettingRow
            icon="info"
            iconColor="#6B7280"
            title="App Version"
            subtitle="v1.0.0"
          />
          <SettingRow
            icon="description"
            iconColor="#6B7280"
            title="Terms of Service"
            subtitle="Read our terms and conditions"
          />
          <SettingRow
            icon="privacy-tip"
            iconColor="#6B7280"
            title="Privacy Policy"
            subtitle="How we handle your data"
          />
        </View>

        <TouchableOpacity
          className="flex-row items-center justify-center py-4 rounded-2xl bg-red-50 dark:bg-red-900/20"
          onPress={() => {
            Alert.alert(
              "Reset Settings",
              "Are you sure you want to reset all settings to default?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Reset",
                  style: "destructive",
                  onPress: () => Alert.alert("Settings Reset", "All settings have been reset."),
                },
              ]
            );
          }}
        >
          <MaterialIcons name="restart-alt" size={20} color="#EF4444" />
          <ThemedText className="ml-2 font-semibold text-red-500">Reset Settings</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

function SettingHeader({ label }: { label: string }) {
  return (
    <View className="px-4 pt-4 pb-2">
      <ThemedText className="text-xs font-semibold text-[#0EA5E9] uppercase">{label}</ThemedText>
    </View>
  );
}

function SettingRow({
  icon,
  iconColor,
  title,
  subtitle,
}: {
  icon: string;
  iconColor: string;
  title: string;
  subtitle: string;
}) {
  return (
    <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
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
