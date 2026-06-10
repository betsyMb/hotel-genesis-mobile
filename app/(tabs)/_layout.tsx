import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/use-theme-color";
import { TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks";
import { RoleGuard } from "@/components/RoleGuard";
import { ThemedText } from "@/components/ThemedText";

function ClientTabs() {
  const backgroundColor = useThemeColor({}, "background");
  const tintColor = useThemeColor({}, "tint");
  const router = useRouter();
  const { user, logout } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor,
        },
        headerTintColor: tintColor,
        headerLeft: () => (
          <View className="ml-4">
            {user && (
              <ThemedText className="font-semibold">{user.full_name}</ThemedText>
            )}
          </View>
        ),
        headerRight: () => (
          <View className="flex-row items-center mr-4">
            <TouchableOpacity onPress={toggleTheme} className="p-2 mr-2">
              <MaterialIcons
                name={resolvedTheme === "dark" ? "light-mode" : "dark-mode"}
                size={24}
                color={tintColor}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleLogout} className="p-2">
              <MaterialIcons name="logout" size={24} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ),
        tabBarActiveTintColor: tintColor,
        tabBarInactiveTintColor: "#64748B",
        tabBarStyle: {
          backgroundColor,
          borderTopColor: useThemeColor({ light: "#E2E8F0", dark: "#334155" }, "background"),
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="booking"
        options={{
          title: "Booking",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="event-note" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="rooms"
        options={{
          title: "Rooms",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="hotel" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  return (
    <RoleGuard allowedRoles={["Client"]}>
      <ClientTabs />
    </RoleGuard>
  );
}
