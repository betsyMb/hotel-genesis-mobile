import { Stack } from "expo-router";
import {ThemedView} from "@/components/ThemedView";

export default function AuthLayout() {
  return (
    <ThemedView className="flex-1 justify-center px-6">
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack>
    </ThemedView>
  );
}