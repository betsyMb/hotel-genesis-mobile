import { useState } from "react";
import { TouchableOpacity, View, Modal, ScrollView, Alert, TextInput } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { User, RoleEntity } from "@/hooks/api/types";
import { MaterialIcons } from "@expo/vector-icons";

interface UserFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editingUser: User | null;
  roles: RoleEntity[];
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

export function UserFormModal({ visible, onClose, onSubmit, editingUser, roles }: UserFormModalProps) {
  const [fullName, setFullName] = useState(editingUser?.full_name || "");
  const [email, setEmail] = useState(editingUser?.email || "");
  const [phone, setPhone] = useState(editingUser?.phone || "");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState(editingUser?.id_rol?.toString() || "");
  const [isActive, setIsActive] = useState(editingUser?.is_active ?? true);

  async function handleSubmit() {
    if (!fullName || !email || (!editingUser && !password)) {
      Alert.alert("Error", "Complete los campos obligatorios");
      return;
    }

    const data: any = { full_name: fullName, email, id_rol: Number(roleId), is_active: isActive };
    if (phone) data.phone = phone;
    if (password) data.password_hash = password;

    try {
      await onSubmit(data);
      onClose();
    } catch {
      // error handled by parent
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

          <ScrollView className="flex-1">
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
    </Modal>
  );
}
