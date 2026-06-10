import { useState } from "react";
import { TouchableOpacity, View, FlatList, Modal } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { MaterialIcons } from "@expo/vector-icons";
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead } from "@/hooks";
import { EmptyState } from "./EmptyState";

export function NotificationBell() {
  const { data: unread } = useUnreadCount();
  const [show, setShow] = useState(false);

  return (
    <>
      <TouchableOpacity onPress={() => setShow(true)} className="p-2 relative">
        <MaterialIcons name="notifications-none" size={24} color="#334155" />
        {(unread?.count ?? 0) > 0 && (
          <View className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 items-center justify-center">
            <ThemedText className="text-white text-[10px] font-bold">
              {Math.min(unread?.count ?? 0, 99)}
            </ThemedText>
          </View>
        )}
      </TouchableOpacity>
      <NotificationsModal visible={show} onClose={() => setShow(false)} />
    </>
  );
}

function NotificationsModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { data: notifications, isLoading } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white dark:bg-gray-900 rounded-t-3xl max-h-[70%] min-h-[40%]">
          <View className="flex-row justify-between items-center px-6 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800">
            <ThemedText type="title" className="text-lg">Notificaciones</ThemedText>
            <View className="flex-row gap-2">
              {(notifications?.some((n) => !n.is_read) ?? false) && (
                <TouchableOpacity
                  className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800"
                  onPress={() => markAllAsRead.mutate()}
                >
                  <ThemedText className="text-xs font-semibold text-[#0EA5E9]">Leer todo</ThemedText>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose}>
                <MaterialIcons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          <FlatList
            data={notifications || []}
            keyExtractor={(item) => item.id_notification.toString()}
            className="flex-1 px-4 pt-2"
            renderItem={({ item }) => (
              <TouchableOpacity
                className={`p-4 rounded-xl mb-2 border ${
                  item.is_read
                    ? "border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800"
                    : "border-[#0EA5E9]/20 bg-[#0EA5E9]/5 dark:bg-[#0EA5E9]/10"
                }`}
                onPress={() => { if (!item.is_read) markAsRead.mutate(item.id_notification); }}
              >
                <View className="flex-row items-start">
                  <MaterialIcons
                    name={item.is_read ? "notifications-none" : "notifications-active"}
                    size={20}
                    color={item.is_read ? "#94A3B8" : "#0EA5E9"}
                    style={{ marginRight: 10, marginTop: 2 }}
                  />
                  <View className="flex-1">
                    <ThemedText className={`font-semibold text-sm ${!item.is_read ? "text-[#0EA5E9]" : ""}`}>
                      {item.title}
                    </ThemedText>
                    <ThemedText className="text-xs opacity-60 mt-1">{item.message}</ThemedText>
                    <ThemedText className="text-[10px] opacity-40 mt-1">
                      {new Date(item.created_at).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </ThemedText>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              isLoading ? null : (
                <EmptyState icon="notifications-none" title="Sin notificaciones" subtitle="No tienes notificaciones por ahora" />
              )
            }
            contentContainerClassName="pb-6"
          />
        </View>
      </View>
    </Modal>
  );
}
