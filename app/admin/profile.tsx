import { TouchableOpacity, View, ScrollView, Alert } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuth, useUsers } from "@/hooks";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

export default function AdminProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.replace("/(auth)/login");
  }

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

  const userRole = user?.role || "Administrator";
  const roleColor = roleColors[userRole] || "#EF4444";
  const roleIcon = roleIcons[userRole] || "admin-panel-settings";

  return (
    <ScrollView className="flex-1">
      <ThemedView className="px-5 pt-8 pb-8">
        <View className="items-center mb-6">
          <View
            className="w-24 h-24 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: `${roleColor}20` }}
          >
            <MaterialIcons name={roleIcon as any} size={44} color={roleColor} />
          </View>
          <ThemedText type="title" className="text-center">
            {user?.full_name || "Administrator"}
          </ThemedText>
          <View
            className="mt-2 px-4 py-1.5 rounded-full flex-row items-center"
            style={{ backgroundColor: `${roleColor}15` }}
          >
            <MaterialIcons name={roleIcon as any} size={14} color={roleColor} />
            <ThemedText className="ml-1.5 text-sm font-semibold" style={{ color: roleColor }}>
              {userRole}
            </ThemedText>
          </View>
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden mb-5">
          <View className="px-4 pt-4 pb-2">
            <ThemedText className="text-xs font-semibold text-[#0EA5E9] uppercase">Account Information</ThemedText>
          </View>

          <InfoRow icon="mail-outline" label="Email" value={user?.email || ""} />
          <InfoRow icon="fingerprint" label="User ID" value={`#${user?.id_user}`} />
          <InfoRow icon="badge" label="Full Name" value={user?.full_name || ""} />
          <InfoRow icon="role" label="Role" value={userRole} isLast />
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden mb-5">
          <View className="px-4 pt-4 pb-2">
            <ThemedText className="text-xs font-semibold text-[#0EA5E9] uppercase">Admin Settings</ThemedText>
          </View>

          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100 dark:border-gray-700">
            <View className="w-10 h-10 rounded-xl bg-blue-500/10 items-center justify-center mr-3">
              <MaterialIcons name="people" size={22} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <ThemedText className="font-semibold">Manage Users</ThemedText>
              <ThemedText className="text-xs opacity-60">View and edit user accounts</ThemedText>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#CBD5E1" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100 dark:border-gray-700">
            <View className="w-10 h-10 rounded-xl bg-purple-500/10 items-center justify-center mr-3">
              <MaterialIcons name="security" size={22} color="#8B5CF6" />
            </View>
            <View className="flex-1">
              <ThemedText className="font-semibold">Security</ThemedText>
              <ThemedText className="text-xs opacity-60">Password & two-factor auth</ThemedText>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#CBD5E1" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4">
            <View className="w-10 h-10 rounded-xl bg-green-500/10 items-center justify-center mr-3">
              <MaterialIcons name="storage" size={22} color="#10B981" />
            </View>
            <View className="flex-1">
              <ThemedText className="font-semibold">System Logs</ThemedText>
              <ThemedText className="text-xs opacity-60">View activity logs</ThemedText>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden mb-6">
          <View className="px-4 pt-4 pb-2">
            <ThemedText className="text-xs font-semibold text-[#0EA5E9] uppercase">Support</ThemedText>
          </View>

          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100 dark:border-gray-700">
            <View className="w-10 h-10 rounded-xl bg-amber-500/10 items-center justify-center mr-3">
              <MaterialIcons name="help-outline" size={22} color="#F59E0B" />
            </View>
            <View className="flex-1">
              <ThemedText className="font-semibold">Help & Support</ThemedText>
              <ThemedText className="text-xs opacity-60">FAQs and documentation</ThemedText>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#CBD5E1" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4">
            <View className="w-10 h-10 rounded-xl bg-gray-500/10 items-center justify-center mr-3">
              <MaterialIcons name="bug-report" size={22} color="#6B7280" />
            </View>
            <View className="flex-1">
              <ThemedText className="font-semibold">Report a Bug</ThemedText>
              <ThemedText className="text-xs opacity-60">Help us improve</ThemedText>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className="flex-row items-center justify-center py-4 rounded-2xl bg-red-50 dark:bg-red-900/20"
          onPress={() => {
            Alert.alert(
              "Sign Out",
              "Are you sure you want to sign out?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Sign Out",
                  style: "destructive",
                  onPress: handleLogout,
                },
              ]
            );
          }}
        >
          <MaterialIcons name="logout" size={20} color="#EF4444" />
          <ThemedText className="ml-2 font-semibold text-red-500">
            Sign Out
          </ThemedText>
        </TouchableOpacity>

        <ThemedText className="text-center text-xs opacity-40 mt-8 mb-4">
          Hotel App v1.0.0
        </ThemedText>
      </ThemedView>
    </ScrollView>
  );
}

function InfoRow({
  icon,
  label,
  value,
  isLast,
}: {
  icon: string;
  label: string;
  value: string;
  isLast?: boolean;
}) {
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
