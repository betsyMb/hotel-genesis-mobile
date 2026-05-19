import { useState } from "react";
import { TouchableOpacity, View, Modal, TextInput } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { MaterialIcons } from "@expo/vector-icons";

interface NewUserModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { first_name: string; last_name: string; email: string; dni: string; phone_number: string }) => void;
}

export function NewUserModal({ visible, onClose, onSave }: NewUserModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dni, setDni] = useState("");

  function handleSave() {
    if (!firstName.trim() || !lastName.trim() || !dni.trim()) return;
    onSave({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim() || `walkin-${dni.trim()}@hotel.app`,
      dni: dni.trim(),
      phone_number: phoneNumber.trim(),
    });
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhoneNumber("");
    setDni("");
  }

  function handleClose() {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhoneNumber("");
    setDni("");
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white dark:bg-gray-900 rounded-t-3xl p-6">
          <View className="flex-row justify-between items-center mb-5">
            <ThemedText type="title">New Guest</ThemedText>
            <TouchableOpacity onPress={handleClose}>
              <MaterialIcons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View className="mb-4">
            <ThemedText className="font-semibold text-sm opacity-60 mb-1.5">
              FIRST NAME *
            </ThemedText>
            <TextInput
              className="text-sm dark:text-white py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
              placeholder="John"
              placeholderTextColor="#94A3B8"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
            />
          </View>

          <View className="mb-4">
            <ThemedText className="font-semibold text-sm opacity-60 mb-1.5">
              LAST NAME *
            </ThemedText>
            <TextInput
              className="text-sm dark:text-white py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
              placeholder="Doe"
              placeholderTextColor="#94A3B8"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
            />
          </View>

          <View className="mb-4">
            <ThemedText className="font-semibold text-sm opacity-60 mb-1.5">
              DNI *
            </ThemedText>
            <TextInput
              className="text-sm dark:text-white py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
              placeholder="12345678A"
              placeholderTextColor="#94A3B8"
              value={dni}
              onChangeText={setDni}
              autoCapitalize="characters"
            />
          </View>

          <View className="mb-4">
            <ThemedText className="font-semibold text-sm opacity-60 mb-1.5">
              PHONE
            </ThemedText>
            <TextInput
              className="text-sm dark:text-white py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
              placeholder="+1234567890"
              placeholderTextColor="#94A3B8"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
          </View>

          <View className="mb-6">
            <ThemedText className="font-semibold text-sm opacity-60 mb-1.5">
              EMAIL
            </ThemedText>
            <TextInput
              className="text-sm dark:text-white py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
              placeholder="guest@email.com"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            className="bg-[#0EA5E9] py-4 rounded-xl items-center disabled:opacity-50"
            onPress={handleSave}
            disabled={!firstName.trim() || !lastName.trim() || !dni.trim()}
          >
            <ThemedText className="text-white font-semibold">Add Guest</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
