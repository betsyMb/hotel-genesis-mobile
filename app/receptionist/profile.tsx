import { TouchableOpacity, View, ScrollView, Alert } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/hooks";
import { useRouter } from "expo-router";
import { ProfileRow } from "@/components/shared";
import { MaterialIcons } from "@expo/vector-icons";

export default function ReceptionistProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.replace("/(auth)/login");
  }

  const roleColor = "#3B82F6";

  return (
    <ScrollView className="flex-1">
      <ThemedView className="px-5 pt-8 pb-8">
        <View className="items-center mb-6">
          <View className="w-24 h-24 rounded-full items-center justify-center mb-4" style={{ backgroundColor: `${roleColor}20` }}>
            <MaterialIcons name="reorder" size={44} color={roleColor} />
          </View>
          <ThemedText type="title" className="text-center">{user?.full_name || "Receptionist"}</ThemedText>
          <View className="mt-2 px-4 py-1.5 rounded-full flex-row items-center" style={{ backgroundColor: `${roleColor}15` }}>
            <MaterialIcons name="reorder" size={14} color={roleColor} />
            <ThemedText className="ml-1.5 text-sm font-semibold" style={{ color: roleColor }}>Receptionist</ThemedText>
          </View>
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden mb-5">
          <View className="px-4 pt-4 pb-2">
            <ThemedText className="text-xs font-semibold text-[#0EA5E9] uppercase">Account</ThemedText>
          </View>
          <ProfileRow icon="mail-outline" label="Email" value={user?.email || ""} isLast={false} />
          <ProfileRow icon="fingerprint" label="User ID" value={`#${user?.id_user}`} isLast={false} />
          <ProfileRow icon="badge" label="Full Name" value={user?.full_name || ""} isLast={false} />
          <ProfileRow icon="reorder" label="Role" value="Receptionist" isLast />
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden mb-5">
          <View className="px-4 pt-4 pb-2">
            <ThemedText className="text-xs font-semibold text-[#0EA5E9] uppercase">Settings</ThemedText>
          </View>
          <SettingRow icon="notifications" iconColor="#0EA5E9" title="Notifications" subtitle="Booking alerts" />
          <SettingRow icon="security" iconColor="#8B5CF6" title="Security" subtitle="Password & privacy" />
          <SettingRow icon="help-outline" iconColor="#F59E0B" title="Help & Support" subtitle="FAQs" />
        </View>

        <TouchableOpacity
          className="flex-row items-center justify-center py-4 rounded-2xl bg-red-50 dark:bg-red-900/20"
          onPress={() => {
            Alert.alert("Sign Out", "Are you sure?", [
              { text: "Cancel", style: "cancel" },
              { text: "Sign Out", style: "destructive", onPress: handleLogout },
            ]);
          }}
        >
          <MaterialIcons name="logout" size={20} color="#EF4444" />
          <ThemedText className="ml-2 font-semibold text-red-500">Sign Out</ThemedText>
        </TouchableOpacity>

        <ThemedText className="text-center text-xs opacity-40 mt-8 mb-4">Hotel App v1.0.0</ThemedText>
      </ThemedView>
    </ScrollView>
  );
}

function SettingRow({ icon, iconColor, title, subtitle }: { icon: string; iconColor: string; title: string; subtitle: string }) {
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
