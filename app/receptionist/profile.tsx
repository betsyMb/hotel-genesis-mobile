import { TouchableOpacity, View, ScrollView, Alert, TextInput, Switch, Linking } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuth, useUpdateUser, useBiometric } from "@/hooks";
import { useRouter } from "expo-router";
import { ProfileRow } from "@/components/shared";
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";

export default function ReceptionistProfileScreen() {
  const { user, logout, refreshUser } = useAuth();
  const router = useRouter();
  const updateUser = useUpdateUser();
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneValue, setPhoneValue] = useState(user?.phone || "");
  const [bioPassword, setBioPassword] = useState("");
  const [showBioPassword, setShowBioPassword] = useState(false);
  const { hasHardware, isEnrolled, isEnabled: bioEnabled, loading: bioLoading, toggle: toggleBiometric } = useBiometric();

  async function handleSavePhone() {
    if (phoneValue !== user?.phone) {
      try {
        await updateUser.mutateAsync({ id: Number(user!.id_user), data: { phone: phoneValue } });
        refreshUser({ phone: phoneValue });
      } catch (err: any) {
        Alert.alert("Error", err.message);
      }
    }
    setEditingPhone(false);
  }

  async function handleLogout() {
    await logout();
    router.replace("/(auth)/login");
  }

  const roleColor = "#3B82F6";

  return (
    <ScrollView className="flex-1">
      <ThemedView className="px-5 pt-8 pb-6 items-center">
        <View className="w-24 h-24 rounded-full items-center justify-center mb-4" style={{ backgroundColor: `${roleColor}20` }}>
          <MaterialIcons name="reorder" size={44} color={roleColor} />
        </View>
        <ThemedText type="title" className="text-center">{user?.full_name || "Recepcionista"}</ThemedText>
        <View className="mt-2 px-4 py-1.5 rounded-full flex-row items-center" style={{ backgroundColor: `${roleColor}15` }}>
          <MaterialIcons name="reorder" size={14} color={roleColor} />
          <ThemedText className="ml-1.5 text-sm font-semibold" style={{ color: roleColor }}>Recepcionista</ThemedText>
        </View>
      </ThemedView>

      <ThemedView className="px-5 pb-8">
        <ThemedText type="subtitle" className="mb-3">Información de la Cuenta</ThemedText>

        <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden mb-5">
          <ProfileRow icon="mail-outline" label="Correo electrónico" value={user?.email || ""} isLast={false} />
          <ProfileRow icon="badge" label="Nombre completo" value={user?.full_name || ""} isLast={false} />
          <TouchableOpacity
            className="flex-row items-center p-4 border-b border-gray-100 dark:border-gray-700"
            onPress={() => editingPhone ? handleSavePhone() : setEditingPhone(true)}
          >
            <View className="w-10 h-10 rounded-xl bg-green-500/10 items-center justify-center mr-3">
              <MaterialIcons name="phone" size={22} color="#10B981" />
            </View>
            <View className="flex-1">
              {editingPhone ? (
                <TextInput
                  value={phoneValue}
                  onChangeText={setPhoneValue}
                  placeholder="Número de teléfono"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  className="text-sm dark:text-white py-1"
                  autoFocus
                  onSubmitEditing={handleSavePhone}
                />
              ) : (
                <>
                  <ThemedText className="font-semibold">Teléfono</ThemedText>
                  <ThemedText className="text-xs opacity-60">
                    {user?.phone ? user.phone : "Toca para añadir"}
                  </ThemedText>
                </>
              )}
            </View>
            <MaterialIcons name={editingPhone ? "check" : user?.phone ? "edit" : "add"} size={24} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        <ThemedText type="subtitle" className="mb-3">Ajustes</ThemedText>

        <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden mb-5">
          <View className="flex-row items-center p-4 border-b border-gray-100 dark:border-gray-700">
            <View className="w-10 h-10 rounded-xl bg-[#0EA5E9]/10 items-center justify-center mr-3">
              <MaterialIcons name="notifications" size={22} color="#0EA5E9" />
            </View>
            <View className="flex-1">
              <ThemedText className="font-semibold">Notificaciones</ThemedText>
              <ThemedText className="text-xs opacity-60">Alertas del sistema</ThemedText>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#CBD5E1" />
          </View>

          {hasHardware && (
            <View className="flex-row items-center p-4">
              <TouchableOpacity
                className="flex-row items-center flex-1"
                onPress={async () => {
                  if (!isEnrolled) {
                    await Linking.openSettings();
                  } else if (!bioEnabled) {
                    setBioPassword("");
                    setShowBioPassword(true);
                  }
                }}
                disabled={!isEnrolled && bioLoading}
              >
                <View className="w-10 h-10 rounded-xl bg-purple-500/10 items-center justify-center mr-3">
                  <MaterialIcons name="fingerprint" size={22} color="#8B5CF6" />
                </View>
                <View className="flex-1">
                  <ThemedText className="font-semibold">Huella digital</ThemedText>
                  {!isEnrolled ? (
                    <ThemedText className="text-xs opacity-60">
                      Toca para ir a Ajustes {"->"} Face ID/Touch ID y activarlo
                    </ThemedText>
                  ) : (
                    <ThemedText className="text-xs opacity-60">
                      {bioEnabled ? "Desbloqueo con huella activado" : "Desbloqueo con huella desactivado"}
                    </ThemedText>
                  )}
                </View>
              </TouchableOpacity>
              {isEnrolled && (
                <Switch
                  value={bioEnabled}
                  onValueChange={() => bioEnabled ? toggleBiometric() : setShowBioPassword(true)}
                  disabled={bioLoading}
                  trackColor={{ false: "#D1D5DB", true: "#8B5CF6" }}
                  thumbColor="#FFFFFF"
                />
              )}
            </View>
          )}
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden mb-6">
          <TouchableOpacity className="flex-row items-center p-4">
            <View className="w-10 h-10 rounded-xl bg-amber-500/10 items-center justify-center mr-3">
              <MaterialIcons name="help-outline" size={22} color="#F59E0B" />
            </View>
            <View className="flex-1">
              <ThemedText className="font-semibold">Ayuda y Soporte</ThemedText>
              <ThemedText className="text-xs opacity-60">Preguntas frecuentes y contacto</ThemedText>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className="flex-row items-center justify-center py-4 rounded-2xl bg-red-50 dark:bg-red-900/20"
          onPress={() => {
            Alert.alert("Cerrar Sesión", "¿Estás seguro de que quieres cerrar sesión?", [
              { text: "Cancelar", style: "cancel" },
              { text: "Cerrar Sesión", style: "destructive", onPress: handleLogout },
            ]);
          }}
        >
          <MaterialIcons name="logout" size={20} color="#EF4444" />
          <ThemedText className="ml-2 font-semibold text-red-500">Cerrar Sesión</ThemedText>
        </TouchableOpacity>

        <ThemedText className="text-center text-xs opacity-40 mt-8 mb-4">Hotel App v1.0.0</ThemedText>
      </ThemedView>

      {showBioPassword && (
        <View className="absolute inset-0 bg-black/50 justify-center px-6">
          <View className="bg-white dark:bg-gray-900 rounded-2xl p-6">
            <ThemedText type="title" className="mb-2">Activar huella digital</ThemedText>
            <ThemedText className="text-sm opacity-60 mb-4">Ingresa tu contraseña para activar el desbloqueo con huella</ThemedText>
            <TextInput
              value={bioPassword}
              onChangeText={setBioPassword}
              placeholder="Contraseña"
              placeholderTextColor="#94A3B8"
              secureTextEntry
              className="text-sm dark:text-white py-3 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl mb-4"
              autoFocus
            />
            <View className="flex-row gap-3">
              <TouchableOpacity className="flex-1 py-3 rounded-xl items-center bg-gray-100 dark:bg-gray-800" onPress={() => setShowBioPassword(false)}>
                <ThemedText className="font-semibold opacity-60">Cancelar</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 py-3 rounded-xl items-center bg-purple-500" onPress={async () => {
                if (bioPassword && user?.email) {
                  await toggleBiometric(user.email, bioPassword);
                }
                setShowBioPassword(false);
              }}>
                <ThemedText className="text-white font-semibold">Activar</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
