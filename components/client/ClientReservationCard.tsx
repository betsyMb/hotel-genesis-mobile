import { TouchableOpacity, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { MaterialIcons } from "@expo/vector-icons";
import { Reservation } from "@/hooks/api/types";

function parseDate(str: string): Date {
  const [y, m, d] = str.split("T")[0].split("-").map(Number);
  return new Date(y, m - 1, d);
}

const statusConfig: Record<string, { color: string; label: string }> = {
  pending: { color: "#F59E0B", label: "Pendiente" },
  confirmed: { color: "#10B981", label: "Confirmada" },
  cancelled: { color: "#EF4444", label: "Cancelada" },
  completed: { color: "#3B82F6", label: "Completada" },
  no_show: { color: "#6B7280", label: "No show" },
};

const actionableStatuses = ["pending", "confirmed"];

interface ClientReservationCardProps {
  item: Reservation;
  onEdit?: () => void;
  onCancel?: () => void;
  exchangeRate?: number;
}

export function ClientReservationCard({ item, onEdit, onCancel, exchangeRate }: ClientReservationCardProps) {
  const status = statusConfig[item.reservation_status] || statusConfig.pending;
  const checkIn = parseDate(item.check_in_date);
  const checkOut = parseDate(item.check_out_date);
  const canAct = actionableStatuses.includes(item.reservation_status);

  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-3">
      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: `${status.color}15` }}>
          <MaterialIcons name="event-note" size={20} color={status.color} />
        </View>
        <View className="flex-1">
          <ThemedText className="font-semibold">Habitación {item.room?.room_number || item.id_room}</ThemedText>
          <ThemedText className="text-xs opacity-60">
            {checkIn.toLocaleDateString("en-US", { month: "short", day: "numeric" })} → {checkOut.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </ThemedText>
        </View>
        <View className="items-end">
          <ThemedText className="text-sm font-bold text-[#0EA5E9]">{(item.reservation_status === "completed" || item.reservation_status === "cancelled") && item.total_amount_bs ? `Bs. ${Number(item.total_amount_bs).toLocaleString("es-ES", { maximumFractionDigits: 2 })}` : exchangeRate ? `Bs. ${(item.total_amount * exchangeRate).toLocaleString("es-ES", { maximumFractionDigits: 2 })}` : `$${item.total_amount}`}</ThemedText>
          <ThemedText className="text-xs font-semibold" style={{ color: status.color }}>
            {status.label}
          </ThemedText>
        </View>
      </View>

      {canAct && (
        <View className="flex-row justify-end gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <TouchableOpacity
            className="flex-row items-center px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700"
            onPress={onEdit}
          >
            <MaterialIcons name="edit" size={16} color="#0EA5E9" style={{ marginRight: 4 }} />
            <ThemedText className="text-xs text-[#0EA5E9] font-semibold">Editar</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row items-center px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20"
            onPress={onCancel}
          >
            <MaterialIcons name="cancel" size={16} color="#EF4444" style={{ marginRight: 4 }} />
            <ThemedText className="text-xs text-red-500 font-semibold">Cancelar</ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
