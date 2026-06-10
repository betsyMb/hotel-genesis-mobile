import { useState, useEffect } from "react";
import { TouchableOpacity, ActivityIndicator, View } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import { ThemedView } from "@/components/ThemedView";
import { useAuth, useBiometric } from "@/hooks";
import { MaterialIcons } from "@expo/vector-icons";

import type { Href } from 'expo-router';

function getRouteByRole(role: string): Href {
  switch (role) {
    case "Administrator":
      return "/admin/rooms" as Href;
    case "Manager":
      return "/manager" as Href;
    case "Receptionist":
      return "/receptionist/checkin" as Href;
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
  const { hasHardware, isEnabled: bioEnabled, loading: bioLoading, authenticate, getStoredCredentials } = useBiometric();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      if (!bioLoading && bioEnabled && hasHardware) {
        const ok = await authenticate();
        if (ok) {
          const creds = await getStoredCredentials();
          if (creds) {
            try {
              const user = await login(creds.email, creds.password);
              router.replace(getRouteByRole(user.role) as any);
            } catch {}
          }
        }
      }
    })();
  }, [bioLoading, bioEnabled]);

  async function handleLogin() {
    if (!email || !password) {
      setError("Completa todos los campos");
      return;
    }

    setError("");

    try {
      const user = await login(email, password);
      router.replace(getRouteByRole(user.role) as any);
    } catch (err: any) {
      setError(err.message || "Credenciales inválidas");
    }
  }

  async function handleBioLogin() {
    const ok = await authenticate();
    if (ok) {
      const creds = await getStoredCredentials();
      if (creds) {
        try {
          const user = await login(creds.email, creds.password);
          router.replace(getRouteByRole(user.role) as any);
        } catch {
          setError("Error al iniciar con huella, usa tu correo y contraseña");
        }
      }
    }
  }

  return (
    <ThemedView className="flex-1 justify-center px-6">
      <ThemedText type="title" className="text-center mb-8">Iniciar Sesión</ThemedText>

      {error && (
        <ThemedText className="text-red-500 text-center mb-4">{error}</ThemedText>
      )}

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
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <ThemedText className="text-white font-semibold">Iniciar Sesión</ThemedText>
        )}
      </TouchableOpacity>

      {hasHardware && bioEnabled && (
        <TouchableOpacity
          className="mt-4 py-3 rounded-lg items-center flex-row justify-center bg-purple-500/10 border border-purple-200 dark:border-purple-800"
          onPress={handleBioLogin}
        >
          <MaterialIcons name="fingerprint" size={22} color="#8B5CF6" />
          <ThemedText className="ml-2 font-semibold text-purple-600">
            Iniciar con huella digital
          </ThemedText>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        className="mt-4 items-center"
        onPress={() => router.push("/(auth)/register")}
      >
        <ThemedText>
          ¿No tienes cuenta?{" "}
          <ThemedText className="text-[#0EA5E9] font-semibold">Registrarse</ThemedText>
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}
