import { TouchableOpacity, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { MaterialIcons } from "@expo/vector-icons";
import { Reservation } from "@/hooks/api/types";

function parseDate(str: string): Date {
  const [y, m, d] = str.split("T")[0].split("-").map(Number);
  return new Date(y, m - 1, d);
}

const statusConfig: Record<string, { color: string; icon: string; bg: string; label: string }> = {
  pending: { color: "#F59E0B", icon: "schedule", bg: "#FFF7ED", label: "Pendiente" },
  confirmed: { color: "#10B981", icon: "check-circle", bg: "#ECFDF5", label: "Confirmada" },
  cancelled: { color: "#EF4444", icon: "cancel", bg: "#FEF2F2", label: "Cancelada" },
  completed: { color: "#3B82F6", icon: "event-available", bg: "#EFF6FF", label: "Completada" },
  no_show: { color: "#6B7280", icon: "cancel-presentation", bg: "#F9FAFB", label: "No Show" },
};

interface ReservationCardProps {
  item: Reservation;
  onEdit?: (r: Reservation) => void;
  onDelete?: (id: number) => void;
  onStatusChange?: (r: Reservation) => void;
  onCheckIn?: (r: Reservation) => void;
  onCheckOut?: (r: Reservation) => void;
  showActions?: boolean;
  exchangeRate?: number;
}

export function ReservationCard({ item, onEdit, onDelete, onStatusChange, onCheckIn, onCheckOut, showActions = true, exchangeRate }: ReservationCardProps) {
  const status = statusConfig[item.reservation_status] || statusConfig.pending;
  const checkIn = parseDate(item.check_in_date);
  const checkOut = parseDate(item.check_out_date);
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <View className="border border-gray-300 bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden mb-3">
      <View className="p-4">
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-row items-center flex-1">
            <View className="w-12 h-12 rounded-xl bg-[#0EA5E9]/10 items-center justify-center mr-3">
              <MaterialIcons name="event-note" size={24} color="#0EA5E9" />
            </View>
            <View className="flex-1">
              <ThemedText type="defaultSemiBold">
                Hab. {item.room?.room_number || `#${item.id_room}`}
              </ThemedText>
              <ThemedText className="text-sm opacity-60">
                {item.client?.full_name || `Cliente #${item.id_client}`}
              </ThemedText>
            </View>
          </View>

          <TouchableOpacity
            className="flex-row items-center px-2.5 py-1 rounded-full"
            style={{ backgroundColor: status.bg }}
            onPress={onStatusChange ? () => onStatusChange(item) : undefined}
          >
            <MaterialIcons name={status.icon as any} size={12} color={status.color} />
            <ThemedText className="ml-1 text-xs font-semibold" style={{ color: status.color }}>
              {status.label}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <View className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 mb-3">
          <View className="flex-row items-center">
            <View className="flex-1 items-center">
              <ThemedText className="text-xs opacity-60">Entrada</ThemedText>
              <ThemedText className="font-semibold text-sm mt-0.5">
                {checkIn.toLocaleDateString("es-ES", { month: "short", day: "numeric", year: "numeric" })}
              </ThemedText>
            </View>
            <View className="w-8 h-8 rounded-full bg-[#0EA5E9]/10 items-center justify-center mx-2">
              <MaterialIcons name="arrow-forward" size={18} color="#0EA5E9" />
            </View>
            <View className="flex-1 items-center">
              <ThemedText className="text-xs opacity-60">Salida</ThemedText>
              <ThemedText className="font-semibold text-sm mt-0.5">
                {checkOut.toLocaleDateString("es-ES", { month: "short", day: "numeric", year: "numeric" })}
              </ThemedText>
            </View>
          </View>
        </View>

        <View className="flex-row justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700">
          <View className="flex-row items-center gap-4">
            <View className="flex-row items-center">
              <MaterialIcons name="event-note" size={16} color="#94A3B8" />
              <ThemedText className="ml-1 text-sm opacity-70">{item.service_type === '3hours' ? '3h' : `${nights} noches`}</ThemedText>
            </View>
            <View className="flex-row items-center">
              <MaterialIcons name="people" size={16} color="#94A3B8" />
              <ThemedText className="ml-1 text-sm opacity-70">{item.number_of_guests || 1}</ThemedText>
            </View>
          </View>
          <ThemedText className="text-lg font-bold text-[#0EA5E9]">{(item.reservation_status === "completed" || item.reservation_status === "cancelled") && item.total_amount_bs ? `Bs. ${Number(item.total_amount_bs).toLocaleString("es-ES", { maximumFractionDigits: 2 })}` : exchangeRate ? `Bs. ${(item.total_amount * exchangeRate).toLocaleString("es-ES", { maximumFractionDigits: 2 })}` : `$${item.total_amount}`}</ThemedText>
        </View>

        {item.notes && (
          <View className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <ThemedText className="text-xs opacity-60 italic">"{item.notes}"</ThemedText>
          </View>
        )}

        {showActions && (onEdit || onDelete || onCheckIn || onCheckOut) && (
          <View className="flex-row justify-end mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 gap-2">
            {item.reservation_status === "confirmed" && onCheckIn && (
              <TouchableOpacity
                className="flex-row items-center px-3 py-1.5 rounded-lg bg-green-500"
                onPress={() => onCheckIn(item)}
              >
                <MaterialIcons name="login" size={16} color="white" />
                <ThemedText className="ml-1 text-xs font-semibold text-white">Check In</ThemedText>
              </TouchableOpacity>
            )}
            {onCheckOut && (
              <TouchableOpacity
                className="flex-row items-center px-3 py-1.5 rounded-lg bg-red-500"
                onPress={() => onCheckOut(item)}
              >
                <MaterialIcons name="logout" size={16} color="white" />
                <ThemedText className="ml-1 text-xs font-semibold text-white">Check Out</ThemedText>
              </TouchableOpacity>
            )}
            {onEdit && (
              <TouchableOpacity className="flex-row items-center px-3 py-1.5" onPress={() => onEdit(item)}>
                <MaterialIcons name="edit" size={16} color="#3B82F6" />
                <ThemedText className="ml-1 text-xs font-semibold text-blue-500">Editar</ThemedText>
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity className="flex-row items-center px-3 py-1.5" onPress={() => onDelete(item.id_reservation)}>
                <MaterialIcons name="delete-outline" size={16} color="#EF4444" />
                <ThemedText className="ml-1 text-xs font-semibold text-red-500">Eliminar</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

export function getReservationStatusConfig() {
  return statusConfig;
}
