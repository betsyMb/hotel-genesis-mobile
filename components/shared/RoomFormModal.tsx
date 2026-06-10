import { useState } from "react";
import { TouchableOpacity, View, Modal, ScrollView, TextInput } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Room } from "@/hooks/api/types";
import { MaterialIcons } from "@expo/vector-icons";
import { getRoomStatusConfig } from "./RoomCard";

const roomTypes = ["simple", "double", "suite", "family"] as const;
const statusConfig = getRoomStatusConfig();

interface ToggleOptionProps {
  label: string;
  value: boolean;
  onPress: () => void;
}

function ToggleOption({ label, value, onPress }: ToggleOptionProps) {
  return (
    <TouchableOpacity
      className={`flex-1 flex-row items-center justify-between p-3 rounded-xl ${
        value ? "bg-[#0EA5E9]/10 border border-[#0EA5E9]/30" : "bg-gray-50 dark:bg-gray-800"
      }`}
      onPress={onPress}
    >
      <ThemedText className={value ? "text-[#0EA5E9] font-semibold" : "opacity-60"}>{label}</ThemedText>
      <View className={`w-11 h-6 rounded-full p-0.5 ${value ? "bg-[#0EA5E9]" : "bg-gray-300 dark:bg-gray-600"}`}>
        <View className={`w-5 h-5 rounded-full bg-white transform ${value ? "translate-x-5" : ""}`} />
      </View>
    </TouchableOpacity>
  );
}

interface RoomFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Room>) => void;
  editingRoom: Room | null;
}

function FormInput({
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "number-pad";
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
      multiline={multiline}
      textAlignVertical={multiline ? "top" : "center"}
    />
  );
}

export function RoomFormModal({ visible, onClose, onSubmit, editingRoom }: RoomFormModalProps) {
  const [roomNumber, setRoomNumber] = useState(editingRoom?.room_number || "");
  const [roomType, setRoomType] = useState(editingRoom?.room_type || "simple");
  const [floor, setFloor] = useState(editingRoom?.floor?.toString() || "1");
  const [price, setPrice] = useState(editingRoom?.price_per_night?.toString() || "");
  const [capacity, setCapacity] = useState(editingRoom?.capacity?.toString() || "2");
  const [squareMeters, setSquareMeters] = useState(editingRoom?.square_meters?.toString() || "");
  const [description, setDescription] = useState(editingRoom?.description || "");
  const [hasView, setHasView] = useState(editingRoom?.has_view || false);
  const [hasBalcony, setHasBalcony] = useState(editingRoom?.has_balcony || false);
  const [roomStatus, setRoomStatus] = useState(editingRoom?.room_status || "available");

  async function handleSubmit() {
    if (!roomNumber || !price) {
      return;
    }

    try {
      await onSubmit({
        room_number: roomNumber,
        room_type: roomType as any,
        floor: Number(floor),
        price_per_night: Number(price),
        capacity: Number(capacity) || 2,
        square_meters: squareMeters ? Number(squareMeters) : undefined,
        description: description || undefined,
        has_view: hasView,
        has_balcony: hasBalcony,
        room_status: roomStatus as any,
      });
      onClose();
    } catch {
      // error handled by parent
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white dark:bg-gray-900 rounded-t-3xl p-6 flex-1 max-h-[85%]">
          <View className="flex-row justify-between items-center mb-5">
            <ThemedText type="title">{editingRoom ? "Editar Habitación" : "Nueva Habitación"}</ThemedText>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1">
            <ThemedText className="font-semibold text-sm opacity-60 mb-1.5">NÚMERO DE HABITACIÓN *</ThemedText>
            <FormInput value={roomNumber} onChangeText={setRoomNumber} placeholder="101" />
            <View className="mb-4" />

            <ThemedText className="font-semibold text-sm opacity-60 mb-1.5">TIPO DE HABITACIÓN *</ThemedText>
            <View className="flex-row flex-wrap mb-4 gap-2">
              {roomTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  className={`px-4 py-2 rounded-lg ${roomType === type ? "bg-[#0EA5E9]" : "bg-gray-100 dark:bg-gray-800"}`}
                  onPress={() => setRoomType(type)}
                >
                  <ThemedText className={roomType === type ? "text-white font-semibold" : ""}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <ThemedText className="font-semibold text-sm opacity-60 mb-1.5">PISO</ThemedText>
                <FormInput value={floor} onChangeText={setFloor} placeholder="1" keyboardType="number-pad" />
              </View>
              <View className="flex-1">
                <ThemedText className="font-semibold text-sm opacity-60 mb-1.5">PRECIO *</ThemedText>
                <FormInput value={price} onChangeText={setPrice} placeholder="100" keyboardType="number-pad" />
              </View>
            </View>

            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <ThemedText className="font-semibold text-sm opacity-60 mb-1.5">CAPACIDAD</ThemedText>
                <FormInput value={capacity} onChangeText={setCapacity} placeholder="2" keyboardType="number-pad" />
              </View>
              <View className="flex-1">
                <ThemedText className="font-semibold text-sm opacity-60 mb-1.5">M²</ThemedText>
                <FormInput value={squareMeters} onChangeText={setSquareMeters} placeholder="25" keyboardType="number-pad" />
              </View>
            </View>

            <View className="mb-4">
              <ThemedText className="font-semibold text-sm opacity-60 mb-1.5">ESTADO</ThemedText>
              <View className="flex-row flex-wrap gap-2">
                {Object.entries(statusConfig).map(([key, val]) => (
                  <TouchableOpacity
                    key={key}
                    className={`px-3 py-1.5 rounded-full ${roomStatus === key ? "bg-[#0EA5E9]" : "bg-gray-100 dark:bg-gray-800"}`}
                    onPress={() => setRoomStatus(key as any)}
                  >
                    <ThemedText className={roomStatus === key ? "text-white text-xs font-semibold" : "text-xs"}>
                      {val.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="flex-row gap-3 mb-4">
              <ToggleOption label="Tiene Vista" value={hasView} onPress={() => setHasView(!hasView)} />
              <ToggleOption label="Tiene Balcón" value={hasBalcony} onPress={() => setHasBalcony(!hasBalcony)} />
            </View>

            <ThemedText className="font-semibold text-sm opacity-60 mb-1.5">DESCRIPCIÓN</ThemedText>
            <FormInput value={description} onChangeText={setDescription} placeholder="Descripción opcional..." multiline />
            <View className="mb-6" />

            <TouchableOpacity className="bg-[#0EA5E9] py-4 rounded-xl items-center mb-4" onPress={handleSubmit}>
              <ThemedText className="text-white font-semibold">{editingRoom ? "Actualizar" : "Crear"} Habitación</ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
