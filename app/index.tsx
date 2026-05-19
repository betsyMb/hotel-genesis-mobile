import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks";

function getRouteByRole(role: string): string {
  switch (role) {
    case "Administrator":
      return "/admin/rooms";
    case "Manager":
      return "/manager";
    case "Receptionist":
      return "/receptionist/checkin";
    case "Maintenance":
      return "/maintinence";
    case "Client":
    default:
      return "/(tabs)/home";
  }
}

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated && user) {
      router.replace(getRouteByRole(user.role) as any);
    } else {
      router.replace("/(auth)/login");
    }
  }, [isLoading, isAuthenticated, user]);

  return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color="#0EA5E9" />
    </View>
  );
}
