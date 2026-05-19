import { TouchableOpacity, View, SafeAreaView } from "react-native";
import { Drawer } from "expo-router/drawer";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useTheme } from "@/hooks/use-theme";
import { ThemedText } from "@/components/ThemedText";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import {DrawerActions} from "@react-navigation/native";
import { useAuth } from "@/hooks";
import { RoleGuard } from "@/components/RoleGuard";

const adminLinks = [
  { name: "rooms", title: "Rooms", icon: "hotel" },
  { name: "reservations", title: "Reservations", icon: "event-note" },
  { name: "walkin", title: "Walk-in", icon: "login" },
  { name: "walkin-history", title: "Walk-in History", icon: "history" },
  { name: "users", title: "Users", icon: "people" },
  { name: "reports", title: "Reports", icon: "assessment" },
  { name: "settings", title: "Settings", icon: "settings" },
  { name: "maintenance", title: "Maintenance", icon: "build" },
  { name: "profile", title: "Profile", icon: "person" },
];

function DrawerContent(props: DrawerContentComponentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const backgroundColor = useThemeColor({}, "background");
  const tintColor = useThemeColor({}, "tint");
  const { resolvedTheme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    props.navigation.closeDrawer();
    router.replace("/(auth)/login");
  };

  return (
    <View className="flex-1 p-4" style={{ backgroundColor }}>
      <View className="mt-12 mb-6">
        <ThemedText type="title">Admin</ThemedText>
        {user && (
          <ThemedText className="text-sm opacity-70">{user.email}</ThemedText>
        )}
      </View>

      {adminLinks.map((link) => (
        <TouchableOpacity
          key={link.name}
          className={`flex-row items-center py-3 px-2 rounded-lg mb-1 ${
            pathname === `/admin/${link.name}` || pathname === `${link.name}` ? "bg-gray-200 dark:bg-gray-700" : ""
          }`}
          onPress={() => {
            props.navigation.closeDrawer();
            router.push(`/admin/${link.name}` as any);
          }}
        >
          <MaterialIcons name={link.icon as any} size={24} color={tintColor} />
          <ThemedText className="ml-3">{link.title}</ThemedText>
        </TouchableOpacity>
      ))}

      <View className="mt-auto">
        <TouchableOpacity
          className="flex-row items-center py-3 px-2 rounded-lg mb-2"
          onPress={toggleTheme}
        >
          <MaterialIcons
            name={resolvedTheme === "dark" ? "light-mode" : "dark-mode"}
            size={24}
            color={tintColor}
          />
          <ThemedText className="ml-3">
            {resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center py-3 px-2 rounded-lg"
          onPress={handleLogout}
        >
          <MaterialIcons name="logout" size={24} color="#EF4444" />
          <ThemedText className="ml-3 text-red-500">Cerrar Sesión</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function AdminHeader({ navigation }: { navigation: any }) {
  const { logout } = useAuth();
  const router = useRouter();
  const { resolvedTheme, toggleTheme } = useTheme();
  const tintColor = useThemeColor({}, "tint");

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView style={{ backgroundColor: useThemeColor({}, "background") }}>
      <View className="flex-row justify-between items-center px-4 py-3">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
            className="p-2"
          >
            <MaterialIcons name="menu" size={24} color={tintColor} />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLogout} className="p-2 ml-2">
            <MaterialIcons name="logout" size={24} color={tintColor} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={toggleTheme} className="p-2">
          <MaterialIcons
            name={resolvedTheme === "dark" ? "light-mode" : "dark-mode"}
            size={24}
            color={tintColor}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function AdminDrawer() {
  const backgroundColor = useThemeColor({}, "background");

  return (
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        headerShown: true,
        header: () => <AdminHeader navigation={navigation} />,
        drawerStyle: { width: 280 },
        sceneContainerStyle: { backgroundColor },
      })}
    >
      <Drawer.Screen name="rooms" options={{ title: "Rooms" }} />
      <Drawer.Screen name="reservations" options={{ title: "Reservations" }} />
      <Drawer.Screen name="walkin" options={{ title: "Walk-in" }} />
      <Drawer.Screen name="walkin-history" options={{ title: "Walk-in History" }} />
      <Drawer.Screen name="users" options={{ title: "Users" }} />
      <Drawer.Screen name="reports" options={{ title: "Reports" }} />
      <Drawer.Screen name="settings" options={{ title: "Settings" }} />
      <Drawer.Screen name="maintenance" options={{ title: "Maintenance" }} />
      <Drawer.Screen name="profile" options={{ title: "Profile" }} />
    </Drawer>
  );
}

export default function AdminLayout() {
  return (
    <RoleGuard allowedRoles={["Administrator"]}>
      <AdminDrawer />
    </RoleGuard>
  );
}
