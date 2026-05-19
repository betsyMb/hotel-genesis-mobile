import { TouchableOpacity, View, ScrollView, Alert } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/hooks";
import { useRouter } from "expo-router";
import { ProfileRow } from "@/components/shared";
import { MaterialIcons } from "@expo/vector-icons";

export default function ProfileScreen() {
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

  const userRole = user?.role || "Client";
  const roleColor = roleColors[userRole] || "#6B7280";
  const roleIcon = roleIcons[userRole] || "person";

  return (
    <ScrollView className="flex-1">
      <ThemedView className="px-5 pt-8 pb-6 items-center">
        <View
          className="w-24 h-24 rounded-full items-center justify-center mb-4"
          style={{ backgroundColor: `${roleColor}20` }}
        >
          <MaterialIcons name={roleIcon as any} size={44} color={roleColor} />
        </View>
        <ThemedText type="title" className="text-center">
          {user?.full_name || "User"}
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
      </ThemedView>

      <View className="px-5 pb-8">
        <ThemedText type="subtitle" className="mb-3">Account Information</ThemedText>

        <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden mb-5">
          <ProfileRow icon="mail-outline" label="Email" value={user?.email || ""} isLast={false} />
          <ProfileRow icon="fingerprint" label="User ID" value={`#${user?.id_user}`} isLast={false} />
          <ProfileRow icon="badge" label="Full Name" value={user?.full_name || ""} isLast />
        </View>

        <ThemedText type="subtitle" className="mb-3">Settings</ThemedText>

        <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden mb-5">
          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100 dark:border-gray-700">
            <View className="w-10 h-10 rounded-xl bg-[#0EA5E9]/10 items-center justify-center mr-3">
              <MaterialIcons name="notifications" size={22} color="#0EA5E9" />
            </View>
            <View className="flex-1">
              <ThemedText className="font-semibold">Notifications</ThemedText>
              <ThemedText className="text-xs opacity-60">Booking alerts</ThemedText>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#CBD5E1" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4">
            <View className="w-10 h-10 rounded-xl bg-purple-500/10 items-center justify-center mr-3">
              <MaterialIcons name="security" size={22} color="#8B5CF6" />
            </View>
            <View className="flex-1">
              <ThemedText className="font-semibold">Security</ThemedText>
              <ThemedText className="text-xs opacity-60">Password & privacy</ThemedText>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden mb-6">
          <TouchableOpacity className="flex-row items-center p-4">
            <View className="w-10 h-10 rounded-xl bg-amber-500/10 items-center justify-center mr-3">
              <MaterialIcons name="help-outline" size={22} color="#F59E0B" />
            </View>
            <View className="flex-1">
              <ThemedText className="font-semibold">Help & Support</ThemedText>
              <ThemedText className="text-xs opacity-60">FAQs & contact</ThemedText>
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
      </View>
    </ScrollView>
  );
}
