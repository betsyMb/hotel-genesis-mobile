import { useState } from "react";
import { TouchableOpacity, View, Modal, ScrollView, Alert, TextInput } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { User, RoleEntity } from "@/hooks/api/types";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "@/hooks";

interface UserFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editingUser: User | null;
  roles: RoleEntity[];
  allUsers?: User[];
}

function FormInput({
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secureTextEntry,
  autoCapitalize,
  multiline,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "phone-pad" | "number-pad";
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  multiline?: boolean;
}) {
  return (
    <TextInput
      className="text-sm text-gray-900 dark:text-white py-3 px-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
      placeholderTextColor="#94A3B8"
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType={keyboardType}
      secureTextEntry={secureTextEntry}
      autoCapitalize={autoCapitalize}
      multiline={multiline}
      textAlignVertical={multiline ? "top" : "center"}
    />
  );
}

export function UserFormModal({ visible, onClose, onSubmit, editingUser, roles, allUsers = [] }: UserFormModalProps) {
  const { user: adminUser, verifyPassword } = useAuth();
  const [fullName, setFullName] = useState(editingUser?.full_name || "");
  const [email, setEmail] = useState(editingUser?.email || "");
  const [phone, setPhone] = useState(editingUser?.phone ?? "");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState(editingUser?.id_rol?.toString() ?? "");
  const [isActive, setIsActive] = useState(editingUser?.is_active ?? true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [pendingData, setPendingData] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);

  function buildData(): any {
    const data: any = {};
    if (editingUser) {
      if (fullName !== editingUser.full_name) data.full_name = fullName;
      if (email !== editingUser.email) data.email = email;
      if (Number(roleId) !== editingUser.id_rol) data.id_rol = Number(roleId);
      if (isActive !== editingUser.is_active) data.is_active = isActive;
      if (phone !== editingUser.phone) data.phone = phone;
      if (password) data.password_hash = password;
    } else {
      data.full_name = fullName;
      data.email = email;
      data.id_rol = Number(roleId);
      data.is_active = isActive;
      if (phone) data.phone = phone;
      if (password) data.password_hash = password;
    }
    return data;
  }

  async function handleSubmit() {
    if (!fullName || !email || (!editingUser && !password)) {
      Alert.alert("Error", "Complete los campos obligatorios");
      return;
    }

    const data = buildData();
    const roleChanged = editingUser && Number(roleId) !== editingUser.id_rol;

    if (roleChanged && editingUser) {
      const isEditingSelf = editingUser.id_user === adminUser?.id_user;
      const adminCount = allUsers.filter((u) => u.role === "Administrator").length;
      if (isEditingSelf && adminCount <= 1) {
        Alert.alert(
          "No permitido",
          "No puedes cambiar tu propio rol siendo el único administrador. La app quedaría sin administrador."
        );
        return;
      }

      setPendingData(data);
      setShowPasswordModal(true);
      return;
    }

    try {
      await onSubmit(data);
      onClose();
    } catch {
      // error handled by parent
    }
  }

  async function confirmWithPassword() {
    if (!adminPassword.trim() || !adminUser) return;
    setVerifying(true);
    try {
      const valid = await verifyPassword(adminUser.email, adminPassword);
      if (!valid) {
        Alert.alert("Error", "Contraseña incorrecta");
        setVerifying(false);
        return;
      }
      setShowPasswordModal(false);
      setAdminPassword("");
      try {
        await onSubmit(pendingData);
        onClose();
      } catch {
        // error handled by parent
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "No se pudo verificar la contraseña");
    } finally {
      setVerifying(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white dark:bg-gray-900 rounded-t-3xl p-6 flex-1 max-h-[80%]">
          <View className="flex-row justify-between items-center mb-5">
            <ThemedText type="title">{editingUser ? "Editar Usuario" : "Nuevo Usuario"}</ThemedText>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1" keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
            <ThemedText className="font-semibold text-sm opacity-60 mb-1.5">NOMBRE COMPLETO *</ThemedText>
            <FormInput value={fullName} onChangeText={setFullName} placeholder="Juan Pérez" autoCapitalize="words" />
            <View className="mb-4" />

            <ThemedText className="font-semibold text-sm opacity-60 mb-1.5">CORREO ELECTRÓNICO *</ThemedText>
            <FormInput value={email} onChangeText={setEmail} placeholder="email@example.com" keyboardType="email-address" autoCapitalize="none" />
            <View className="mb-4" />

            <ThemedText className="font-semibold text-sm opacity-60 mb-1.5">TELÉFONO</ThemedText>
            <FormInput value={phone} onChangeText={setPhone} placeholder="+52 123 456 7890" keyboardType="phone-pad" />
            <View className="mb-4" />

            <ThemedText className="font-semibold text-sm opacity-60 mb-1.5">
              {editingUser ? "NUEVA CONTRASEÑA (dejar vacía para mantener)" : "CONTRASEÑA *"}
            </ThemedText>
            <FormInput value={password} onChangeText={setPassword} placeholder="Mín. 6 caracteres" secureTextEntry />
            <View className="mb-4" />

            <ThemedText className="font-semibold text-sm opacity-60 mb-1.5">ROL *</ThemedText>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {roles.map((role) => (
                <TouchableOpacity
                  key={role.id_rol}
                  className={`px-4 py-2 rounded-lg ${roleId === role.id_rol.toString() ? "bg-[#0EA5E9]" : "bg-gray-100 dark:bg-gray-800"}`}
                  onPress={() => setRoleId(role.id_rol.toString())}
                >
                  <ThemedText className={roleId === role.id_rol.toString() ? "text-white text-sm font-semibold" : "text-sm"}>{role.role_name}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              className={`flex-row items-center justify-between p-4 rounded-xl mb-6 ${isActive ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800" : "bg-gray-50 dark:bg-gray-800"}`}
              onPress={() => setIsActive(!isActive)}
            >
              <ThemedText className={isActive ? "text-green-600 font-semibold" : "opacity-60"}>Activo</ThemedText>
              <View className={`w-11 h-6 rounded-full p-0.5 ${isActive ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`}>
                <View className={`w-5 h-5 rounded-full bg-white transform ${isActive ? "translate-x-5" : ""}`} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="bg-[#0EA5E9] py-4 rounded-xl items-center mb-4" onPress={handleSubmit}>
              <ThemedText className="text-white font-semibold">{editingUser ? "Actualizar" : "Crear"} Usuario</ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      {showPasswordModal && (
        <View className="absolute inset-0 z-50 justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="mx-6 bg-white dark:bg-gray-800 rounded-2xl p-6">
            <View className="flex-row items-center mb-4">
              <MaterialIcons name="lock" size={24} color="#F59E0B" />
              <ThemedText type="title" className="ml-2">Confirmar Cambio de Rol</ThemedText>
            </View>
            <ThemedText className="text-sm opacity-60 mb-4">
              Ingrese su contraseña para confirmar el cambio de rol del usuario.
            </ThemedText>
            <TextInput
              className="text-sm dark:text-white py-3 px-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl mb-4"
              placeholder="Su contraseña"
              placeholderTextColor="#94A3B8"
              value={adminPassword}
              onChangeText={setAdminPassword}
              secureTextEntry
              autoFocus
            />
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 py-3 rounded-xl items-center bg-gray-100 dark:bg-gray-700"
                onPress={() => { setShowPasswordModal(false); setAdminPassword(""); setPendingData(null); }}
              >
                <ThemedText className="font-semibold opacity-60">Cancelar</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3 rounded-xl items-center bg-[#0EA5E9] disabled:opacity-50"
                onPress={confirmWithPassword}
                disabled={!adminPassword.trim() || verifying}
              >
                <ThemedText className="text-white font-semibold">{verifying ? "Verificando..." : "Confirmar"}</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </Modal>
  );
}
