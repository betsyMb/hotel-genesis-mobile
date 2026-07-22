import { useState } from "react";
import { TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/hooks";
import { api } from "@/hooks/api/client";
import { ENDPOINTS } from "@/hooks/api/types";

import type { Href } from 'expo-router';

function getRouteByRole(role: string): Href {
  switch (role) {
    case "Administrator":
      return "/(admin)/rooms" as Href;
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

export default function RegisterScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleRegister() {
    if (!fullName || !email || !password) {
      setError("Completa todos los campos");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      await api.postPublic(ENDPOINTS.auth.register, {
        full_name: fullName,
        email,
        password,
      });

      const user = await login(email, password);
      router.replace(getRouteByRole(user.role) as any);
    } catch (err: any) {
      const msg = err.message || "";
      if (msg.includes("ya está registrado")) {
        setError("Este correo ya está registrado. Comuníquese con el hotel para asignarle una contraseña.");
      } else {
        setError(msg || "Error al registrarse");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
    <ThemedView className="flex-1 justify-center px-6">
      <ThemedText type="title" className="text-center mb-8">Registrarse</ThemedText>

      {error && (
        <ThemedText className="text-red-500 text-center mb-4">{error}</ThemedText>
      )}

      <ThemedTextInput
        icon="person-outline"
        placeholder="Nombre completo"
        value={fullName}
        onChangeText={setFullName}
        autoCapitalize="words"
        className="mb-4"
      />

      <ThemedTextInput
        icon="mail-outline"
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        className="mb-4"
      />

      <ThemedTextInput
        icon="lock-closed-outline"
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        className="mb-6"
      />

      <TouchableOpacity
        className="bg-[#0EA5E9] py-3 rounded-lg items-center disabled:opacity-50"
        onPress={handleRegister}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <ThemedText className="text-white font-semibold">Registrarse</ThemedText>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        className="mt-4 items-center"
        onPress={() => router.push("/(auth)/login")}
      >
        <ThemedText>
          ¿Ya tienes cuenta?{" "}
          <ThemedText className="text-[#0EA5E9] font-semibold">Iniciar Sesión</ThemedText>
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
    </KeyboardAvoidingView>
  );
}
