import { useState } from "react";
import {
  View, FlatList, TouchableOpacity, RefreshControl,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { MaterialIcons } from "@expo/vector-icons";
import { useWalkinHistory } from "@/hooks";
import { WalkInHistoryItem } from "@/hooks/api/walkin-types";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", {
    month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function formatDateShort(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function DetailModal({ item, visible, onClose }: { item: WalkInHistoryItem | null; visible: boolean; onClose: () => void }) {
  if (!visible || !item) return null;

  return (
    <View className="absolute inset-0 z-50">
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white dark:bg-gray-900 rounded-t-3xl">
          <View className="flex-row items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
            <ThemedText type="title">Detalles de Salida</ThemedText>
            <TouchableOpacity
              className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center"
              onPress={onClose}
            >
              <MaterialIcons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View className="p-5">
            <View className="bg-[#6366F1]/5 rounded-xl p-4 mb-4 flex-row items-center">
              <View className="w-12 h-12 rounded-xl bg-[#6366F1]/10 items-center justify-center mr-4">
                <MaterialIcons name="hotel" size={28} color="#6366F1" />
              </View>
              <View>
                <ThemedText className="text-lg font-bold">
                  Habitación {item.room_number || `#${item.room_id}`}
                </ThemedText>
                {item.room_type && (
                  <ThemedText className="text-sm opacity-60 capitalize">{item.room_type}</ThemedText>
                )}
              </View>
            </View>

            <View className="mb-4">
              <ThemedText className="text-xs font-semibold opacity-60 uppercase mb-2">Huésped Principal</ThemedText>
              <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 flex-row items-center">
                <MaterialIcons name="person" size={20} color="#94A3B8" style={{ marginRight: 10 }} />
                <ThemedText className="text-base">{item.guest_signature || "Desconocido"}</ThemedText>
              </View>
            </View>

            {item.guests.length > 1 && (
              <View className="mb-4">
                <ThemedText className="text-xs font-semibold opacity-60 uppercase mb-2">
                  Huéspedes Adicionales ({item.guests.length - 1})
                </ThemedText>
                {item.guests.slice(1).map((g, i) => (
                  <View
                    key={i}
                    className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mb-1.5 flex-row items-center"
                  >
                    <MaterialIcons name="person-outline" size={18} color="#94A3B8" style={{ marginRight: 10 }} />
                    <View className="flex-1">
                      <ThemedText className="text-sm">{g.full_name}</ThemedText>
                      {g.dni && <ThemedText className="text-xs opacity-60">DNI: {g.dni}</ThemedText>}
                    </View>
                  </View>
                ))}
              </View>
            )}

            <View className="mb-4">
              <ThemedText className="text-xs font-semibold opacity-60 uppercase mb-2">Detalles de Estancia</ThemedText>
              <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center">
                    <MaterialIcons name="login" size={18} color="#0EA5E9" style={{ marginRight: 8 }} />
                    <ThemedText className="text-sm opacity-70">Entrada</ThemedText>
                  </View>
                  <ThemedText className="text-sm font-medium">{formatDate(item.checked_in)}</ThemedText>
                </View>
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center">
                    <MaterialIcons name="logout" size={18} color="#EF4444" style={{ marginRight: 8 }} />
                    <ThemedText className="text-sm opacity-70">Salida</ThemedText>
                  </View>
                  <ThemedText className="text-sm font-medium">{formatDate(item.checked_out)}</ThemedText>
                </View>
                <View className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
                  <View className="flex-row items-center justify-between pt-1">
                  <View className="flex-row items-center">
                    <MaterialIcons name="nights-stay" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
                    <ThemedText className="text-sm opacity-70">{item.service_type === '3hours' ? 'Servicio' : 'Total noches'}</ThemedText>
                  </View>
                  <ThemedText className="text-base font-bold text-[#6366F1]">
                    {item.service_type === '3hours' ? '3 horas' : `${item.total_nights} noche${item.total_nights !== 1 ? "s" : ""}`}
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function HistoryCard({
  item,
  onPress,
}: {
  item: WalkInHistoryItem;
  onPress: (item: WalkInHistoryItem) => void;
}) {
  return (
    <TouchableOpacity
      className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 border border-gray-200 dark:border-gray-700 shadow-sm"
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 rounded-lg bg-[#6366F1]/10 items-center justify-center mr-3">
            <MaterialIcons name="hotel" size={22} color="#6366F1" />
          </View>
          <View className="flex-1">
            <ThemedText className="font-semibold text-base">
              Habitación {item.room_number || `#${item.room_id}`}
            </ThemedText>
            {item.room_type && (
              <ThemedText className="text-xs opacity-60 capitalize">{item.room_type}</ThemedText>
            )}
          </View>
        </View>
        <View className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
          <ThemedText className="text-xs font-semibold opacity-60">
            {item.service_type === '3hours' ? '3h' : `${item.total_nights} noche${item.total_nights !== 1 ? 's' : ''}`}
          </ThemedText>
        </View>
      </View>

      {item.guest_signature && (
        <View className="flex-row items-center mb-1">
          <MaterialIcons name="person" size={16} color="#94A3B8" style={{ marginRight: 6 }} />
          <ThemedText className="text-sm" numberOfLines={1}>{item.guest_signature}</ThemedText>
        </View>
      )}

      {item.guests.length > 1 && (
        <View className="ml-6 mb-1">
          <ThemedText className="text-xs opacity-60">
            +{item.guests.length - 1} {(item.guests.length - 1) !== 1 ? "huéspedes adicionales" : "huésped adicional"}
          </ThemedText>
        </View>
      )}

      <View className="flex-row items-center mt-1">
        <MaterialIcons name="logout" size={14} color="#EF4444" style={{ marginRight: 4 }} />
        <ThemedText className="text-xs opacity-60" numberOfLines={1}>
          Salió: {formatDateShort(item.checked_out)}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

export function WalkInHistory() {
  const { data: history, isLoading, refetch } = useWalkinHistory();
  const [selected, setSelected] = useState<WalkInHistoryItem | null>(null);

  function renderHeader() {
    return (
      <View className="px-5 pt-4 pb-2">
        <ThemedText type="title">Historial de Walk-Ins</ThemedText>
        <ThemedText className="opacity-60 text-sm mb-4">
          {history?.length || 0} salida{(history?.length || 0) !== 1 ? "s" : ""} completada{(history?.length || 0) !== 1 ? "s" : ""}
        </ThemedText>
      </View>
    );
  }

  function renderEmpty() {
    if (isLoading) return null;
    return (
      <View className="flex-1 items-center justify-center px-10 py-20">
        <View className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-4">
          <MaterialIcons name="history" size={32} color="#94A3B8" />
        </View>
        <ThemedText className="text-lg font-semibold mb-1">Sin historial aún</ThemedText>
        <ThemedText className="text-sm opacity-60 text-center">
          Las salidas de walk-in completadas aparecerán aquí.
        </ThemedText>
      </View>
    );
  }

  return (
    <ThemedView className="flex-1">
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ThemedText className="opacity-60">Cargando...</ThemedText>
        </View>
      ) : (
        <FlatList
          data={history || []}
          keyExtractor={(item) => item.id_occupancy.toString()}
          renderItem={({ item }) => <HistoryCard item={item} onPress={setSelected} />}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerClassName="pb-8"
          className="px-5"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} />
          }
        />
      )}

      <DetailModal
        item={selected}
        visible={!!selected}
        onClose={() => setSelected(null)}
      />
    </ThemedView>
  );
}
