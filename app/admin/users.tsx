import { useState } from "react";
import { FlatList, TouchableOpacity, View, Alert, Modal } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { StatBadge, EmptyState, UserCard, UserFormModal } from "@/components/shared";
import { useUsers, useRoles, useCreateUser, useUpdateUser, useDeleteUser } from "@/hooks";
import { User } from "@/hooks/api/types";
import { MaterialIcons } from "@expo/vector-icons";

export default function AdminUsersScreen() {
  const { data: users, isLoading } = useUsers();
  const { data: roles } = useRoles();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [showFilter, setShowFilter] = useState(false);

  async function handleCreate(data: any) {
    try {
      await createUser.mutateAsync(data);
      Alert.alert("Éxito", "Usuario creado exitosamente");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  }

  async function handleUpdate(data: any) {
    console.log("HEREEEE", {data, editingUser})
    if (!editingUser) return;
    try {
      await updateUser.mutateAsync({ id: editingUser.id_user, data });
      setEditingUser(null);
      Alert.alert("Éxito", "Usuario actualizado exitosamente");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  }

  function handleDelete(id: number) {
    Alert.alert("Eliminar Usuario", "¿Estás seguro? Esto no se puede deshacer.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteUser.mutateAsync(id);
            Alert.alert("Eliminado", "Usuario eliminado exitosamente");
          } catch (err: any) {
            Alert.alert("Error", err.message);
          }
        },
      },
    ]);
  }

  const roleFilters = [
    { key: "all", label: "Todos" },
    { key: "Administrator", label: "Administradores" },
    { key: "Manager", label: "Gerentes" },
    { key: "Receptionist", label: "Recepcionistas" },
    { key: "Maintenance", label: "Mantenimiento" },
    { key: "Client", label: "Clientes" },
  ];

  const filteredUsers = filter === "all"
    ? (users || [])
    : (users || []).filter((u) => u.role === filter);

  const stats = {
    total: users?.length || 0,
    active: users?.filter((u) => u.is_active !== false).length || 0,
    admin: users?.filter((u) => u.role === "Administrator").length || 0,
    manager: users?.filter((u) => u.role === "Manager").length || 0,
    receptionist: users?.filter((u) => u.role === "Receptionist").length || 0,
    maintenance: users?.filter((u) => u.role === "Maintenance").length || 0,
    clients: users?.filter((u) => u.role === "Client").length || 0,
  };

  return (
    <ThemedView className="flex-1">
        <View className="px-5 py-3 border-b border-gray-100 dark:border-gray-800">
          <View className="flex-row flex-wrap gap-2 mb-3">
            {filter === "all" ? (
              <StatBadge label="Total" value={stats.total} color="#0EA5E9" />
            ) : filter === "Administrator" ? (
              <StatBadge label="Administradores" value={stats.admin} color="#EF4444" />
            ) : filter === "Manager" ? (
              <StatBadge label="Gerentes" value={stats.manager} color="#F59E0B" />
            ) : filter === "Receptionist" ? (
              <StatBadge label="Recepcionistas" value={stats.receptionist} color="#3B82F6" />
            ) : filter === "Maintenance" ? (
              <StatBadge label="Mantenimiento" value={stats.maintenance} color="#6B7280" />
            ) : filter === "Client" ? (
              <StatBadge label="Clientes" value={stats.clients} color="#8B5CF6" />
            ) : null}
          </View>
          <TouchableOpacity
            className="flex-row items-center justify-between bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3"
            onPress={() => setShowFilter(true)}
          >
            <View className="flex-row items-center">
              <MaterialIcons name="filter-list" size={20} color="#94A3B8" style={{ marginRight: 8 }} />
              <ThemedText className="text-sm font-medium">{roleFilters.find((f) => f.key === filter)?.label || "Filtrar"}</ThemedText>
            </View>
            <MaterialIcons name="expand-more" size={22} color="#94A3B8" />
          </TouchableOpacity>
        </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id_user.toString()}
        className="flex-1"
        renderItem={({ item }) => (
          <UserCard
            item={item}
            onEdit={(u) => { setEditingUser(u); setShowForm(true); }}
            onDelete={handleDelete}
          />
        )}
        contentContainerClassName="px-4 py-4"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={!isLoading ? <EmptyState icon="people" title="No hay usuarios" /> : null}
      />

      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-[#0EA5E9] items-center justify-center shadow-lg"
        onPress={() => { setEditingUser(null); setShowForm(true); }}
      >
        <MaterialIcons name="add" size={28} color="white" />
      </TouchableOpacity>

      <Modal visible={showFilter} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white dark:bg-gray-900 rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-4">
              <ThemedText type="title">Filtrar por Rol</ThemedText>
              <TouchableOpacity onPress={() => setShowFilter(false)}>
                <MaterialIcons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            {roleFilters.map((f) => (
              <TouchableOpacity
                key={f.key}
                className={`flex-row items-center p-4 rounded-xl mb-2 border ${
                  filter === f.key
                    ? "border-[#0EA5E9] bg-[#0EA5E9]/5"
                    : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                }`}
                onPress={() => { setFilter(f.key); setShowFilter(false); }}
              >
                <View className="flex-1">
                  <ThemedText className="font-semibold">{f.label}</ThemedText>
                </View>
                {filter === f.key && (
                  <MaterialIcons name="check-circle" size={22} color="#0EA5E9" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <UserFormModal
        key={editingUser?.id_user ?? "new"}
        visible={showForm}
        onClose={() => { setShowForm(false); setEditingUser(null); }}
        onSubmit={editingUser ? handleUpdate : handleCreate}
        editingUser={editingUser}
        roles={roles || []}
      />
    </ThemedView>
  );
}
