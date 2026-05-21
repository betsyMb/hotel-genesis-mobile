import { useState } from "react";
import {
  View, FlatList, TouchableOpacity, Alert, Modal, RefreshControl,
} from "react-native";
import { useRouter, usePathname } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { MaterialIcons } from "@expo/vector-icons";
import { useOccupancies, useWalkinCheckin, useWalkinCheckout } from "@/hooks";
import { Occupancy } from "@/hooks/api/types";
import { WalkInForm } from "./WalkInForm";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function OccupancyCard({
  item,
  onCheckout,
}: {
  item: Occupancy;
  onCheckout: (o: Occupancy) => void;
}) {
  return (
    <TouchableOpacity
      className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 border border-gray-200 dark:border-gray-700 shadow-sm"
      onPress={() => onCheckout(item)}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-lg bg-[#0EA5E9]/10 items-center justify-center mr-3">
            <MaterialIcons name="hotel" size={22} color="#0EA5E9" />
          </View>
          <View>
            <ThemedText className="font-semibold text-base">
              Room {item.room?.room_number || `#${item.id_room}`}
            </ThemedText>
            {item.room?.room_type && (
              <ThemedText className="text-xs opacity-60 capitalize">
                {item.room.room_type}
              </ThemedText>
            )}
          </View>
        </View>
        <View className="bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
          <ThemedText className="text-xs font-semibold text-green-700 dark:text-green-400">
            Active
          </ThemedText>
        </View>
      </View>

      {item.guest_signature && (
        <View className="flex-row items-center mb-1">
          <MaterialIcons name="person" size={16} color="#94A3B8" style={{ marginRight: 6 }} />
          <ThemedText className="text-sm">{item.guest_signature}</ThemedText>
        </View>
      )}

      <View className="flex-row items-center">
        <MaterialIcons name="calendar-today" size={16} color="#94A3B8" style={{ marginRight: 6 }} />
        <ThemedText className="text-xs opacity-60">
          Checked in: {formatDate(item.actual_check_in)}
        </ThemedText>
      </View>

      <View className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex-row items-center">
        <MaterialIcons name="logout" size={16} color="#EF4444" style={{ marginRight: 6 }} />
        <ThemedText className="text-xs text-red-500 font-medium">
          Tap to checkout
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

export function WalkInDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const rolePrefix = pathname.startsWith("/receptionist") ? "receptionist" : "admin";
  const { data: occupancies, isLoading, refetch } = useOccupancies();
  const walkinCheckin = useWalkinCheckin();
  const walkinCheckout = useWalkinCheckout();
  const [showForm, setShowForm] = useState(false);

  const activeOccupancies = (occupancies || [])
    .filter((o) => o.occupancy_status === "active")
    .sort((a, b) => new Date(b.actual_check_in).getTime() - new Date(a.actual_check_in).getTime());

  function handleCheckout(occupancy: Occupancy) {
    const roomNumber = occupancy.room?.room_number || `#${occupancy.id_room}`;
    const guestName = occupancy.guest_signature || "Unknown";

    Alert.alert(
      "Check-out",
      `Check out ${guestName} from Room ${roomNumber}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Check Out",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await walkinCheckout.mutateAsync({
                room_id: occupancy.id_room,
              });
              refetch();
              Alert.alert(
                "Check-out successful",
                `Room ${result.room_number}\n${guestName}\n${result.total_nights} night${result.total_nights !== 1 ? "s" : ""}\nChecked in: ${formatDate(result.checked_in)}\nChecked out: ${formatDate(result.checked_out)}`,
              );
            } catch (err: any) {
              Alert.alert("Error", err.message);
            }
          },
        },
      ],
    );
  }

  function renderHeader() {
    return (
      <View className="px-5 pt-4 pb-2">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <ThemedText type="title">Walk-Ins</ThemedText>
            <ThemedText className="opacity-60 text-sm">
              {activeOccupancies.length} active check-in{activeOccupancies.length !== 1 ? "s" : ""}
            </ThemedText>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity
              className="bg-gray-100 dark:bg-gray-800 flex-row items-center px-3 py-2.5 rounded-xl"
              onPress={() => router.push(`/${rolePrefix}/walkin-history` as any)}
            >
              <MaterialIcons name="history" size={20} color="#64748B" />
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-[#0EA5E9] flex-row items-center px-4 py-2.5 rounded-xl"
              onPress={() => setShowForm(true)}
            >
              <MaterialIcons name="add" size={20} color="white" />
              <ThemedText className="text-white font-semibold ml-1">Check In</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  function renderEmpty() {
    return (
      <View className="flex-1 items-center justify-center px-10 py-20">
        <View className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-4">
          <MaterialIcons name="hotel" size={32} color="#94A3B8" />
        </View>
        <ThemedText className="text-lg font-semibold mb-1">No active check-ins</ThemedText>
        <ThemedText className="text-sm opacity-60 text-center mb-6">
          All rooms are available. Tap "Check In" to register a walk-in guest.
        </ThemedText>
        <TouchableOpacity
          className="bg-[#0EA5E9] flex-row items-center px-6 py-3 rounded-xl"
          onPress={() => setShowForm(true)}
        >
          <MaterialIcons name="person-add" size={20} color="white" />
          <ThemedText className="text-white font-semibold ml-2">Check In</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ThemedView className="flex-1">
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ThemedText className="opacity-60">Loading...</ThemedText>
        </View>
      ) : (
        <FlatList
          data={activeOccupancies}
          keyExtractor={(item) => item.id_occupancy.toString()}
          renderItem={({ item }) => (
            <OccupancyCard item={item} onCheckout={handleCheckout} />
          )}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerClassName="pb-8"
          className="px-5"
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} />
          }
        />
      )}

      <Modal visible={showForm} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 pt-12 bg-white dark:bg-gray-900">
          <View className="flex-row items-center justify-between px-5 pb-2 border-b border-gray-200 dark:border-gray-700">
            <ThemedText type="title">New Walk-In</ThemedText>
            <TouchableOpacity
              className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center"
              onPress={() => setShowForm(false)}
            >
              <MaterialIcons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>
          <WalkInForm
            onSuccess={() => {
              setShowForm(false);
              refetch();
            }}
          />
        </View>
      </Modal>
    </ThemedView>
  );
}
