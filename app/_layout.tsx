import { Stack } from "expo-router";
import { View } from "react-native";
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from "@/hooks/use-theme";
import { QueryProvider } from "@/hooks/providers/query-provider";
import { AuthProvider } from "@/hooks/auth/use-auth";
import "../global.css"

function RootLayoutNav() {
  const backgroundColor = '#FFFFFF';

  return (
    <View style={{ flex: 1, backgroundColor }}>
      <StatusBar style="dark" backgroundColor={backgroundColor} />
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
    </View>
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