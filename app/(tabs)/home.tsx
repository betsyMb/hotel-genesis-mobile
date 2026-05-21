import { ScrollView, View, ActivityIndicator, TouchableOpacity, FlatList, RefreshControl } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuth, useRooms, useReservations } from "@/hooks";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Reservation } from "@/hooks/api/types";

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: rooms, isLoading: roomsLoading } = useRooms();
  const { data: reservations } = useReservations();

  const availableRooms = rooms?.filter((r) => r.room_status === "available") || [];
  const myReservations = reservations?.filter(
    (r: Reservation) => r.id_client === user?.id_user
  ) || [];
  const activeReservations = myReservations.filter(
    (r: Reservation) => r.reservation_status === "pending" || r.reservation_status === "confirmed"
  );

  if (roomsLoading) {
    return (
      <ThemedView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0EA5E9" />
      </ThemedView>
    );
  }

  const backgroundColor = useThemeColor({}, "background");

  return (
    <ScrollView className="flex-1" style={{ backgroundColor }}>
      <View className="px-5 pt-6 pb-4">
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <ThemedText className="text-lg opacity-60">Welcome back</ThemedText>
            <ThemedText type="title">{user?.full_name?.split(" ")[0] || "Guest"}</ThemedText>
          </View>
          <View className="w-12 h-12 rounded-full bg-[#0EA5E9]/10 items-center justify-center">
            <MaterialIcons name="person" size={24} color="#0EA5E9" />
          </View>
        </View>

        <View className="flex-row -mx-2 mb-6">
          <StatCard
            icon="hotel"
            label="Rooms"
            value={availableRooms.length.toString()}
            color="#0EA5E9"
            bgColor="#0EA5E9/10"
          />
          <StatCard
            icon="event-note"
            label="Bookings"
            value={myReservations.length.toString()}
            color="#8B5CF6"
            bgColor="#8B5CF6/10"
          />
          <StatCard
            icon="check-circle"
            label="Active"
            value={activeReservations.length.toString()}
            color="#10B981"
            bgColor="#10B981/10"
          />
        </View>

        <View className="bg-[#0EA5E9] rounded-2xl p-5 mb-6">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <ThemedText className="text-white/80 text-sm">Quick Action</ThemedText>
              <ThemedText className="text-white text-lg font-semibold mt-1">
                Book a Room
              </ThemedText>
              <ThemedText className="text-white/70 text-xs mt-1">
                {availableRooms.length} rooms available
              </ThemedText>
            </View>
            <TouchableOpacity
              className="bg-white px-5 py-3 rounded-xl"
              onPress={() => router.push("/(tabs)/booking")}
            >
              <ThemedText className="text-[#0EA5E9] font-semibold">Book Now</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-row justify-between items-center mb-3">
          <ThemedText type="subtitle">Available Rooms</ThemedText>
          <TouchableOpacity onPress={() => router.push("/(tabs)/rooms")}>
            <ThemedText className="text-[#0EA5E9] font-semibold text-sm">View All</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-5 pb-6">
        <FlatList
          data={availableRooms.slice(0, 5)}
          keyExtractor={(item) => item.id_room.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-3"
          renderItem={({ item }) => (
            <TouchableOpacity
              className="w-52 bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4"
              onPress={() => router.push("/(tabs)/booking")}
            >
              <View className="flex-row justify-between items-start mb-3">
                <View className="w-10 h-10 rounded-xl bg-[#0EA5E9]/10 items-center justify-center">
                  <MaterialIcons name="hotel" size={22} color="#0EA5E9" />
                </View>
                <View className="bg-green-500/10 px-2 py-0.5 rounded-full">
                  <ThemedText className="text-green-600 text-xs font-semibold">
                    Free
                  </ThemedText>
                </View>
              </View>
              <ThemedText className="text-sm opacity-60">
                {item.room_type.charAt(0).toUpperCase() + item.room_type.slice(1)}
              </ThemedText>
              <ThemedText className="text-lg font-bold text-[#0EA5E9] mt-1">
                ${item.price_per_night}
                <ThemedText className="text-sm font-normal opacity-60">/night</ThemedText>
              </ThemedText>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 items-center">
              <MaterialIcons name="hotel" size={32} color="#CBD5E1" />
              <ThemedText className="mt-2 opacity-60">No rooms available</ThemedText>
            </View>
          }
        />
      </View>

      <View className="px-5 pb-8">
        <View className="flex-row justify-between items-center mb-3">
          <ThemedText type="subtitle">Recent Bookings</ThemedText>
          <TouchableOpacity onPress={() => router.push("/(tabs)/booking")}>
            <ThemedText className="text-[#0EA5E9] font-semibold text-sm">View All</ThemedText>
          </TouchableOpacity>
        </View>

        {myReservations.slice(0, 3).map((r: Reservation) => {
          const statusColors: Record<string, string> = {
            pending: "#F59E0B",
            confirmed: "#10B981",
            cancelled: "#EF4444",
            completed: "#3B82F6",
            no_show: "#6B7280",
          };
          const color = statusColors[r.reservation_status] || "#6B7280";
          const checkIn = new Date(r.check_in_date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          const checkOut = new Date(r.check_out_date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });

          return (
            <TouchableOpacity
              key={r.id_reservation}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-3 flex-row items-center"
              onPress={() => router.push("/(tabs)/booking")}
            >
              <View className="w-10 h-10 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: `${color}15` }}>
                <MaterialIcons name="event-note" size={20} color={color} />
              </View>
              <View className="flex-1">
                <ThemedText className="font-semibold">
                  Room {r.room?.room_number || r.id_room}
                </ThemedText>
                <ThemedText className="text-xs opacity-60">
                  {checkIn} → {checkOut}
                </ThemedText>
              </View>
              <View className="items-end">
                <ThemedText className="text-sm font-bold text-[#0EA5E9]">
                  ${r.total_amount}
                </ThemedText>
                <ThemedText className="text-xs font-semibold" style={{ color }}>
                  {r.reservation_status.charAt(0).toUpperCase() + r.reservation_status.slice(1)}
                </ThemedText>
              </View>
            </TouchableOpacity>
          );
        })}

        {myReservations.length === 0 && (
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 items-center">
            <MaterialIcons name="event-note" size={32} color="#CBD5E1" />
            <ThemedText className="mt-2 opacity-60">No bookings yet</ThemedText>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  bgColor,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
  bgColor: string;
}) {
  return (
    <View className="flex-1 mx-2">
      <View className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm">
        <View className="w-8 h-8 rounded-lg items-center justify-center mb-2" style={{ backgroundColor: bgColor }}>
          <MaterialIcons name={icon as any} size={18} color={color} />
        </View>
        <ThemedText className="text-xl font-bold">{value}</ThemedText>
        <ThemedText className="text-xs opacity-60">{label}</ThemedText>
      </View>
    </View>
  );
}
