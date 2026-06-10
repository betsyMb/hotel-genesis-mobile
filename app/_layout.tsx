import { Stack } from "expo-router";
import { ThemeProvider, useTheme } from "@/hooks/use-theme";
import { QueryProvider } from "@/hooks/providers/query-provider";
import { AuthProvider } from "@/hooks/auth/use-auth";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect } from "react";
import * as NavigationBar from "expo-navigation-bar";
import { Platform, StatusBar } from "react-native";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import "../global.css"

function RootLayoutNav() {
  const { resolvedTheme } = useTheme();
  const backgroundColor = resolvedTheme === "dark" ? "#111827" : "#FFFFFF";
  const navigationBarColor = resolvedTheme === "dark" ? "#111827" : "#FFFFFF";
  usePushNotifications();

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync(navigationBarColor);
      NavigationBar.setButtonStyleAsync(resolvedTheme === "dark" ? "light" : "dark");
    }
  }, [resolvedTheme, navigationBarColor]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }} edges={["top"]}>
      <StatusBar
        barStyle={resolvedTheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={backgroundColor}
        translucent={false}
      />
      <Stack
        screenOptions={{
          contentStyle: { flex: 1, backgroundColor },
          headerShadowVisible: false,
          headerStyle: { backgroundColor },
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="admin" />
        <Stack.Screen name="manager" />
        <Stack.Screen name="receptionist" />
        <Stack.Screen name="maintinence" />
      </Stack>
    </SafeAreaView>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}