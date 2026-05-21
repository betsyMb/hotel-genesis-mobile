import { useState } from "react";
import { FlatList, TouchableOpacity, View, Alert } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { StatBadge, EmptyState, UserCard, UserFormModal } from "@/components/shared";
import { useUsers, useRoles, useCreateUser, useUpdateUser, useDeleteUser } from "@/hooks";
import { User, RoleEntity } from "@/hooks/api/types";
import { MaterialIcons } from "@expo/vector-icons";

export default function AdminUsersScreen() {
  const { data: users, isLoading } = useUsers();
  const { data: roles } = useRoles();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  async function handleCreate(data: any) {
    try {
      await createUser.mutateAsync(data);
      Alert.alert("Success", "User created!");
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
      Alert.alert("Success", "User updated!");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  }

  function handleDelete(id: number) {
    Alert.alert("Delete User", "Are you sure? This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteUser.mutateAsync(id);
            Alert.alert("Deleted", "User deleted successfully");
          } catch (err: any) {
            Alert.alert("Error", err.message);
          }
        },
      },
    ]);
  }

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
          <StatBadge label="Total" value={stats.total} color="#0EA5E9" />
          <StatBadge label="Active" value={stats.active} color="#10B981" />
          <StatBadge label="Admins" value={stats.admin} color="#EF4444" />
          <StatBadge label="Mgrs" value={stats.manager} color="#F59E0B" />
          <StatBadge label="Recept." value={stats.receptionist} color="#3B82F6" />
          <StatBadge label="Maint." value={stats.maintenance} color="#6B7280" />
          <StatBadge label="Clients" value={stats.clients} color="#8B5CF6" />
        </View>
      </View>

      <FlatList
        data={users || []}
        keyExtractor={(item) => item.id_user.toString()}
        renderItem={({ item }) => (
          <UserCard
            item={item}
            onEdit={(u) => { setEditingUser(u); setShowForm(true); }}
            onDelete={handleDelete}
          />
        )}
        contentContainerClassName="px-4 py-4"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={!isLoading ? <EmptyState icon="people" title="No users found" /> : null}
      />

      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-[#0EA5E9] items-center justify-center shadow-lg"
        onPress={() => { setEditingUser(null); setShowForm(true); }}
      >
        <MaterialIcons name="add" size={28} color="white" />
      </TouchableOpacity>

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
