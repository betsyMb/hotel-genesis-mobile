import { TouchableOpacity, View, TextInput } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { MaterialIcons } from "@expo/vector-icons";
import { WalkInGuest } from "@/hooks/api/walkin-types";

interface GuestFormRowProps {
  guest: WalkInGuest;
  index: number;
  onChange: (index: number, field: keyof WalkInGuest, value: string) => void;
  onRemove: (index: number) => void;
}

export function GuestFormRow({ guest, index, onChange, onRemove }: GuestFormRowProps) {
  return (
    <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mb-2 border border-gray-200 dark:border-gray-700">
      <View className="flex-row justify-between items-center mb-2">
        <ThemedText className="text-xs font-semibold opacity-60 uppercase">
          Huésped #{index + 1}
        </ThemedText>
        <TouchableOpacity onPress={() => onRemove(index)}>
          <MaterialIcons name="close" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View className="flex-row gap-2 mb-2">
        <View className="flex-1 flex-row items-center">
          <MaterialIcons name="person" size={16} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            className="flex-1 text-sm dark:text-white py-2 px-3 bg-white dark:bg-gray-700 rounded-lg"
            placeholder="Nombre"
            placeholderTextColor="#94A3B8"
            value={guest.first_name}
            onChangeText={(v) => onChange(index, "first_name", v)}
            autoCapitalize="words"
          />
        </View>
        <View className="flex-1 flex-row items-center">
          <TextInput
            className="flex-1 text-sm dark:text-white py-2 px-3 bg-white dark:bg-gray-700 rounded-lg"
            placeholder="Apellido"
            placeholderTextColor="#94A3B8"
            value={guest.last_name}
            onChangeText={(v) => onChange(index, "last_name", v)}
            autoCapitalize="words"
          />
        </View>
      </View>

      <View className="flex-row gap-2">
        <View className="flex-1 flex-row items-center">
          <MaterialIcons name="badge" size={16} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            className="flex-1 text-sm dark:text-white py-2 px-3 bg-white dark:bg-gray-700 rounded-lg"
            placeholder="DNI"
            placeholderTextColor="#94A3B8"
            value={guest.dni}
            onChangeText={(v) => onChange(index, "dni", v)}
          />
        </View>
        <View className="flex-1 flex-row items-center">
          <MaterialIcons name="phone" size={16} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            className="flex-1 text-sm dark:text-white py-2 px-3 bg-white dark:bg-gray-700 rounded-lg"
            placeholder="Teléfono"
            placeholderTextColor="#94A3B8"
            value={guest.phone_number}
            onChangeText={(v) => onChange(index, "phone_number", v)}
            keyboardType="phone-pad"
          />
        </View>
      </View>
    </View>
  );
}