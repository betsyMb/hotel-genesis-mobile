import { ReactNode, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks";
import { Role } from "@/hooks/api/types";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: Role[];
  fallbackRoute?: string;
}

export function RoleGuard({ children, allowedRoles, fallbackRoute = "/(auth)/login" }: RoleGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace(fallbackRoute as any);
        return;
      }

      if (user && !allowedRoles.includes(user.role)) {
        let redirectRoute: string;
        switch (user.role) {
          case "Administrator":
            redirectRoute = "/(admin)/rooms";
            break;
          case "Manager":
            redirectRoute = "/manager";
            break;
          case "Receptionist":
            redirectRoute = "/(receptionist)/checkin";
            break;
          case "Maintenance":
            redirectRoute = "/maintinence";
            break;
          case "Client":
          default:
            redirectRoute = "/(tabs)/home";
            break;
        }
        router.replace(redirectRoute as any);
        return;
      }
    }
  }, [isLoading, isAuthenticated, user]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  if (!isAuthenticated || (user && !allowedRoles.includes(user.role))) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  return children;
}
