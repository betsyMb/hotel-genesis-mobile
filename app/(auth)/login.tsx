import { useState } from "react";
import { TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/hooks";

import type { Href } from 'expo-router';

function getRouteByRole(role: string): Href {
  switch (role) {
    case "Administrator":
      return "/admin/rooms" as Href;
    case "Manager":
      return "/manager" as Href;
    case "Receptionist":
      return "/(receptionist)/checkin" as Href;
    case "Maintenance":
      return "/maintinence" as Href;
    case "Client":
    default:
      return "/(tabs)/home" as Href;
  }
}

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin() {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setError("");

    try {
      const user = await login(email, password);
      router.replace(getRouteByRole(user.role) as any);
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    }
  }

  return (
    <ThemedView className="flex-1 justify-center px-6">
      <ThemedText type="title" className="text-center mb-8">Login</ThemedText>

      {error && (
        <ThemedText className="text-red-500 text-center mb-4">{error}</ThemedText>
      )}

      <ThemedTextInput
        icon="mail-outline"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        className="mb-4"
      />

      <ThemedTextInput
        icon="lock-closed-outline"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        className="mb-6"
      />

      <TouchableOpacity
        className="bg-[#0EA5E9] py-3 rounded-lg items-center disabled:opacity-50"
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <ThemedText className="text-white font-semibold">Sign In</ThemedText>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        className="mt-4 items-center"
        onPress={() => router.push("/(auth)/register")}
      >
        <ThemedText>
          Don&apos;t have an account?{" "}
          <ThemedText className="text-[#0EA5E9] font-semibold">Register</ThemedText>
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}
