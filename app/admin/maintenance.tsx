import { useState } from "react";
import { FlatList, TouchableOpacity, View, Alert, Modal, ScrollView } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ThemedTextInput from "@/components/ThemedTextInput";
import { useRooms, useUpdateRoom, useServices, useCreateService, useDeleteService } from "@/hooks";
import { Room, Service } from "@/hooks/api/types";
import { MaterialIcons } from "@expo/vector-icons";

function MaintenanceRoomCard({ item, onToggle }: { item: Room; onToggle: (r: Room) => void }) {
  const isMaintenance = item.room_status === "maintenance";

  return (
    <View className={`rounded-2xl shadow-sm overflow-hidden mb-3 border-2 ${
      isMaintenance ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800" : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700"
    }`}>
      <View className="p-4">
        <View className="flex-row justify-between items-start">
          <View className="flex-row items-center">
            <View className={`w-12 h-12 rounded-xl items-center justify-center mr-3 ${
              isMaintenance ? "bg-amber-500/20" : "bg-gray-100 dark:bg-gray-700"
            }`}>
              <MaterialIcons name="build" size={24} color={isMaintenance ? "#F59E0B" : "#94A3B8"} />
            </View>
            <View>
              <ThemedText type="defaultSemiBold">Room {item.room_number}</ThemedText>
              <ThemedText className="text-sm opacity-60">
                {item.room_type.charAt(0).toUpperCase() + item.room_type.slice(1)}
              </ThemedText>
            </View>
          </View>

          <View className={`px-2.5 py-1 rounded-full ${
            isMaintenance ? "bg-amber-500/20" : "bg-gray-100 dark:bg-gray-700"
          }`}>
            <ThemedText className={`text-xs font-semibold ${isMaintenance ? "text-amber-600" : "opacity-60"}`}>
              {item.room_status === "maintenance" ? "In Maintenance" : item.room_status}
            </ThemedText>
          </View>
        </View>

        {item.description && (
          <ThemedText className="text-sm opacity-60 mt-3 italic">"{item.description}"</ThemedText>
        )}

        <TouchableOpacity
          className={`mt-4 py-3 rounded-xl items-center ${
            isMaintenance ? "bg-green-500" : "bg-amber-500"
          }`}
          onPress={() => onToggle(item)}
        >
          <ThemedText className="text-white font-semibold">
            {isMaintenance ? "Mark as Available" : "Send to Maintenance"}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ServiceCard({ item, onDelete }: { item: Service; onDelete: (id: number) => void }) {
  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-2 shadow-sm">
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 rounded-lg bg-purple-500/10 items-center justify-center mr-3">
            <MaterialIcons name="room-service" size={20} color="#8B5CF6" />
          </View>
          <View className="flex-1">
            <ThemedText className="font-semibold">{item.service_name}</ThemedText>
            {item.description && (
              <ThemedText className="text-xs opacity-60">{item.description}</ThemedText>
            )}
          </View>
        </View>

        <View className="flex-row items-center">
          <ThemedText className="text-lg font-bold text-[#0EA5E9] mr-3">${item.price}</ThemedText>
          <TouchableOpacity onPress={() => onDelete(item.id_service)}>
            <MaterialIcons name="delete-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
      <View className="mt-2">
        <View className={`px-2 py-0.5 rounded-full self-start ${
          item.is_active ? "bg-green-500/10" : "bg-gray-200 dark:bg-gray-700"
        }`}>
          <ThemedText className={`text-xs font-semibold ${item.is_active ? "text-green-600" : "opacity-60"}`}>
            {item.is_active ? "Active" : "Inactive"}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

function ServiceFormModal({
  visible,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { service_name: string; price: number; description?: string; is_active: boolean }) => void;
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  function handleSubmit() {
    if (!name || !price) {
      Alert.alert("Error", "Name and price are required");
      return;
    }

    onSubmit({
      service_name: name,
      price: Number(price),
      description: description || undefined,
      is_active: isActive,
    });

    setName("");
    setPrice("");
    setDescription("");
    setIsActive(true);
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white dark:bg-gray-900 rounded-t-3xl p-6">
          <View className="flex-row justify-between items-center mb-5">
            <ThemedText type="title">New Service</ThemedText>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ThemedText className="font-semibold text-sm opacity-60 mb-1.5">SERVICE NAME *</ThemedText>
          <ThemedTextInput value={name} onChangeText={setName} placeholder="Spa, Restaurant..." className="bg-gray-50 dark:bg-gray-800 mb-4" />

          <ThemedText className="font-semibold text-sm opacity-60 mb-1.5">PRICE *</ThemedText>
          <ThemedTextInput value={price} onChangeText={setPrice} placeholder="50" keyboardType="number-pad" className="bg-gray-50 dark:bg-gray-800 mb-4" />

          <ThemedText className="font-semibold text-sm opacity-60 mb-1.5">DESCRIPTION</ThemedText>
          <ThemedTextInput value={description} onChangeText={setDescription} placeholder="Optional description..." className="bg-gray-50 dark:bg-gray-800 mb-4" multiline />

          <TouchableOpacity
            className={`flex-row items-center justify-between p-4 rounded-xl mb-6 ${
              isActive ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800" : "bg-gray-50 dark:bg-gray-800"
            }`}
            onPress={() => setIsActive(!isActive)}
          >
            <ThemedText className={isActive ? "text-green-600 font-semibold" : "opacity-60"}>Active</ThemedText>
            <View className={`w-11 h-6 rounded-full p-0.5 ${isActive ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`}>
              <View className={`w-5 h-5 rounded-full bg-white transform ${isActive ? "translate-x-5" : ""}`} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="bg-[#0EA5E9] py-4 rounded-xl items-center" onPress={handleSubmit}>
            <ThemedText className="text-white font-semibold">Create Service</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function AdminMaintenanceScreen() {
  const { data: rooms, isLoading: roomsLoading, refetch: refetchRooms } = useRooms();
  const { data: services, isLoading: servicesLoading, refetch: refetchServices } = useServices();
  const updateRoom = useUpdateRoom();
  const createService = useCreateService();
  const deleteService = useDeleteService();

  const [showServiceForm, setShowServiceForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"rooms" | "services">("rooms");

  async function handleToggleMaintenance(room: Room) {
    const newStatus = room.room_status === "maintenance" ? "available" : "maintenance";
    try {
      await updateRoom.mutateAsync({
        id: room.id_room,
        data: { room_status: newStatus as any },
      });
      refetchRooms();
      Alert.alert("Success", `Room ${room.room_number} marked as ${newStatus}`);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  }

  async function handleCreateService(data: any) {
    try {
      await createService.mutateAsync(data);
      refetchServices();
      Alert.alert("Success", "Service created!");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  }

  function handleDeleteService(id: number) {
    Alert.alert("Delete Service", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteService.mutateAsync(id);
            refetchServices();
            Alert.alert("Deleted", "Service removed");
          } catch (err: any) {
            Alert.alert("Error", err.message);
          }
        },
      },
    ]);
  }

  const maintenanceRooms = rooms?.filter((r) => r.room_status === "maintenance") || [];

  return (
    <ThemedView className="flex-1">
      <View className="px-5 py-3 border-b border-gray-100 dark:border-gray-800">
        <View className="flex-row bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          <TouchableOpacity
            className={`flex-1 py-2 rounded-lg items-center ${
              activeTab === "rooms" ? "bg-white dark:bg-gray-700 shadow-sm" : ""
            }`}
            onPress={() => setActiveTab("rooms")}
          >
            <MaterialIcons name="build" size={18} color={activeTab === "rooms" ? "#0EA5E9" : "#94A3B8"} />
            <ThemedText className={`text-sm font-semibold mt-0.5 ${activeTab === "rooms" ? "text-[#0EA5E9]" : "opacity-60"}`}>
              Rooms ({maintenanceRooms.length})
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 py-2 rounded-lg items-center ${
              activeTab === "services" ? "bg-white dark:bg-gray-700 shadow-sm" : ""
            }`}
            onPress={() => setActiveTab("services")}
          >
            <MaterialIcons name="room-service" size={18} color={activeTab === "services" ? "#0EA5E9" : "#94A3B8"} />
            <ThemedText className={`text-sm font-semibold mt-0.5 ${activeTab === "services" ? "text-[#0EA5E9]" : "opacity-60"}`}>
              Services ({services?.length || 0})
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === "rooms" && (
        <FlatList
          data={rooms || []}
          keyExtractor={(item) => item.id_room.toString()}
          renderItem={({ item }) => (
            <MaintenanceRoomCard item={item} onToggle={handleToggleMaintenance} />
          )}
          contentContainerClassName="px-4 py-4"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !roomsLoading ? (
              <View className="justify-center items-center py-12">
                <MaterialIcons name="build" size={48} color="#CBD5E1" />
                <ThemedText className="mt-3 opacity-60">No rooms found</ThemedText>
              </View>
            ) : null
          }
        />
      )}

      {activeTab === "services" && (
        <View className="flex-1">
          <FlatList
            data={services || []}
            keyExtractor={(item) => item.id_service.toString()}
            renderItem={({ item }) => (
              <ServiceCard item={item} onDelete={handleDeleteService} />
            )}
            contentContainerClassName="px-4 py-4"
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              !servicesLoading ? (
                <View className="justify-center items-center py-12">
                  <MaterialIcons name="room-service" size={48} color="#CBD5E1" />
                  <ThemedText className="mt-3 opacity-60">No services yet</ThemedText>
                </View>
              ) : null
            }
          />

          <TouchableOpacity
            className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-[#0EA5E9] items-center justify-center shadow-lg"
            onPress={() => setShowServiceForm(true)}
          >
            <MaterialIcons name="add" size={28} color="white" />
          </TouchableOpacity>
        </View>
      )}

      <ServiceFormModal
        visible={showServiceForm}
        onClose={() => setShowServiceForm(false)}
        onSubmit={handleCreateService}
      />
    </ThemedView>
  );
}
