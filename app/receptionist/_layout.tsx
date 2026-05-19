import { TouchableOpacity, View, SafeAreaView } from "react-native";
import { Drawer } from "expo-router/drawer";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useTheme } from "@/hooks/use-theme";
import { ThemedText } from "@/components/ThemedText";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { DrawerActions } from "@react-navigation/native";
import { useAuth } from "@/hooks";
import { RoleGuard } from "@/components/RoleGuard";

const receptionistLinks = [
  { name: "checkin", title: "Check-in", icon: "login" },
  { name: "checkout", title: "Check-out", icon: "logout" },
  { name: "walkin", title: "Walk-in", icon: "person-add" },
  { name: "walkin-history", title: "Walk-in History", icon: "history" },
  { name: "reservations", title: "Reservations", icon: "event-note" },
  { name: "rooms", title: "Rooms", icon: "hotel" },
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
        <ThemedText type="title">Receptionist</ThemedText>
        {user && (
          <ThemedText className="text-sm opacity-70">{user.full_name}</ThemedText>
        )}
      </View>

      {receptionistLinks.map((link) => (
        <TouchableOpacity
          key={link.name}
          className={`flex-row items-center py-3 px-2 rounded-lg mb-1 ${
            pathname === `/receptionist/${link.name}` || pathname === `${link.name}` ? "bg-gray-200 dark:bg-gray-700" : ""
          }`}
          onPress={() => {
            props.navigation.closeDrawer();
            router.push(`/receptionist/${link.name}` as any);
          }}
        >
          <MaterialIcons name={link.icon as any} size={24} color={tintColor} />
          <ThemedText className="ml-3">{link.title}</ThemedText>
        </TouchableOpacity>
      ))}

      <View className="mt-auto">
        <TouchableOpacity className="flex-row items-center py-3 px-2 rounded-lg mb-2" onPress={toggleTheme}>
          <MaterialIcons name={resolvedTheme === "dark" ? "light-mode" : "dark-mode"} size={24} color={tintColor} />
          <ThemedText className="ml-3">{resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"}</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center py-3 px-2 rounded-lg" onPress={handleLogout}>
          <MaterialIcons name="logout" size={24} color="#EF4444" />
          <ThemedText className="ml-3 text-red-500">Cerrar Sesión</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ReceptionistHeader({ navigation }: { navigation: any }) {
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
          <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())} className="p-2">
            <MaterialIcons name="menu" size={24} color={tintColor} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} className="p-2 ml-2">
            <MaterialIcons name="logout" size={24} color={tintColor} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={toggleTheme} className="p-2">
          <MaterialIcons name={resolvedTheme === "dark" ? "light-mode" : "dark-mode"} size={24} color={tintColor} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function ReceptionistDrawer() {
  const backgroundColor = useThemeColor({}, "background");

  return (
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        headerShown: true,
        header: () => <ReceptionistHeader navigation={navigation} />,
        drawerStyle: { width: 280 },
        sceneContainerStyle: { backgroundColor },
      })}
    >
      <Drawer.Screen name="checkin" options={{ title: "Check-in" }} />
      <Drawer.Screen name="checkout" options={{ title: "Check-out" }} />
      <Drawer.Screen name="walkin" options={{ title: "Walk-in" }} />
      <Drawer.Screen name="walkin-history" options={{ title: "Walk-in History" }} />
      <Drawer.Screen name="reservations" options={{ title: "Reservations" }} />
      <Drawer.Screen name="rooms" options={{ title: "Rooms" }} />
      <Drawer.Screen name="profile" options={{ title: "Profile" }} />
    </Drawer>
  );
}

export default function ReceptionistLayout() {
  return (
    <RoleGuard allowedRoles={["Administrator", "Manager", "Receptionist"]}>
      <ReceptionistDrawer />
    </RoleGuard>
  );
}
