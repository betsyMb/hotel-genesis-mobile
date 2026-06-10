import { useEffect, useState } from "react";
import { TouchableOpacity, View, TextInput } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { MaterialIcons } from "@expo/vector-icons";
import { Room, MaintenanceTask } from "@/hooks/api/types";
import { useUpdateRoomTasks } from "@/hooks";

let taskIdCounter = Date.now();
function genId() { return (++taskIdCounter).toString(); }

interface MaintenanceRoomCardProps {
  item: Room;
  onMarkMaintenance: (r: Room, tasks: MaintenanceTask[]) => void;
  onMarkAvailable: (r: Room, tasks: MaintenanceTask[]) => void;
}

export function MaintenanceRoomCard({ item, onMarkMaintenance, onMarkAvailable }: MaintenanceRoomCardProps) {
  const isMaintenance = item.room_status === "maintenance";
  const updateTasks = useUpdateRoomTasks();

  const [tasks, setTasks] = useState<MaintenanceTask[]>(item.maintenance_tasks || []);
  const [showInput, setShowInput] = useState(false);
  const [inputMode, setInputMode] = useState<"maintenance" | "available">("maintenance");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (item.maintenance_tasks) {
      setTasks(item.maintenance_tasks);
    }
  }, [item.id_room, item.maintenance_tasks]);

  function syncTasks(updated: MaintenanceTask[]) {
    setTasks(updated);
    updateTasks.mutate({ id: item.id_room, tasks: updated });
  }

  function addTask() {
    if (!newTaskDesc.trim()) return;
    syncTasks([...tasks, { id: genId(), description: newTaskDesc.trim(), completed: false }]);
    setNewTaskDesc("");
  }

  function removeTask(id: string) {
    syncTasks(tasks.filter((t) => t.id !== id));
  }

  function toggleTask(id: string) {
    syncTasks(tasks.map((t) => t.id === id ? { ...t, completed: !t.completed } : t));
  }

  function openInput(mode: "maintenance" | "available") {
    setInputMode(mode);
    setNewTaskDesc("");
    setShowInput(true);
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      if (inputMode === "maintenance") {
        await onMarkMaintenance(item, tasks);
      } else {
        await onMarkAvailable(item, tasks);
      }
    } finally {
      setSubmitting(false);
      setShowInput(false);
    }
  }

  const incompleteCount = tasks.filter((t) => !t.completed).length;
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
              <ThemedText type="defaultSemiBold">Hab. {item.room_number}</ThemedText>
              <ThemedText className="text-sm opacity-60">
                {item.room_type.charAt(0).toUpperCase() + item.room_type.slice(1)} · Piso {item.floor}
              </ThemedText>
            </View>
          </View>

          <View className={`px-2.5 py-1 rounded-full ${isMaintenance ? "bg-amber-500/20" : incompleteCount > 0 ? "bg-red-100 dark:bg-red-900/30" : "bg-gray-100 dark:bg-gray-700"}`}>
            <ThemedText className={`text-xs font-semibold ${isMaintenance ? "text-amber-600" : incompleteCount > 0 ? "text-red-500" : "opacity-60"}`}>
              {isMaintenance ? "Mantenimiento" : incompleteCount > 0 ? `${incompleteCount} pendiente${incompleteCount !== 1 ? "s" : ""}` : item.room_status}
            </ThemedText>
          </View>
        </View>

        {/* Tasks — always visible when there are any */}
        {tasks.length > 0 && (
          <View className="mt-3 space-y-1">
            {tasks.map((task) => (
              <View key={task.id} className="flex-row items-center bg-white/50 dark:bg-gray-800/50 rounded-xl px-3 py-2.5">
                <TouchableOpacity onPress={() => toggleTask(task.id)} className="mr-3">
                  <MaterialIcons
                    name={task.completed ? "check-circle" : "radio-button-unchecked"}
                    size={22}
                    color={task.completed ? "#10B981" : "#94A3B8"}
                  />
                </TouchableOpacity>
                <ThemedText className={`flex-1 text-sm ${task.completed ? "line-through opacity-40" : ""}`}>
                  {task.description}
                </ThemedText>
                <TouchableOpacity onPress={() => removeTask(task.id)} className="ml-2">
                  <MaterialIcons name="close" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Add new task input */}
        {showInput && (
          <View className="mt-3">
            <View className="flex-row items-center gap-2 mb-3">
              <TextInput
                className="flex-1 text-sm dark:text-white py-3 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                placeholder={inputMode === "maintenance" ? "Agregar tarea (ej. Limpiar, Pintar)" : "Agregar tarea final (ej. Filtro reemplazado)"}
                placeholderTextColor="#94A3B8"
                value={newTaskDesc}
                onChangeText={setNewTaskDesc}
              />
              <TouchableOpacity
                className="w-11 h-11 rounded-xl bg-[#0EA5E9] items-center justify-center"
                onPress={addTask}
              >
                <MaterialIcons name="add" size={22} color="white" />
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-2">
              <TouchableOpacity
                className={`flex-1 py-3 rounded-xl items-center bg-gray-100 dark:bg-gray-800 ${submitting ? "opacity-50" : ""}`}
                onPress={() => setShowInput(false)}
                disabled={submitting}
              >
                <ThemedText className="font-semibold opacity-60">Cancelar</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3 rounded-xl items-center ${inputMode === "maintenance" ? "bg-amber-500" : "bg-green-500"} ${submitting ? "opacity-50" : ""}`}
                onPress={handleSubmit}
                disabled={submitting}
              >
                <ThemedText className="text-white font-semibold">
                  {submitting ? "Guardando..." : (inputMode === "maintenance" ? "Iniciar Mantenimiento" : "Completar y Disponible")}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Incomplete tasks warning (when not in maintenance and not adding) */}
        {!isMaintenance && !showInput && incompleteCount > 0 && (
          <View className="mt-3 bg-red-50 dark:bg-red-900/10 rounded-xl p-3">
            <View className="flex-row items-start">
              <MaterialIcons name="warning" size={18} color="#EF4444" style={{ marginRight: 8, marginTop: 1 }} />
              <ThemedText className="text-sm flex-1">{incompleteCount} tarea{incompleteCount !== 1 ? "s" : ""} pendiente{incompleteCount !== 1 ? "s" : ""} — márcalas o agrega nuevas</ThemedText>
            </View>
          </View>
        )}

        {/* Add task quick button (always visible when not in add mode) */}
        {!showInput && (
          <TouchableOpacity
            className="mt-3 py-2 rounded-xl items-center border border-dashed border-gray-300 dark:border-gray-600"
            onPress={() => openInput(isMaintenance ? "available" : "maintenance")}
          >
            <View className="flex-row items-center">
              <MaterialIcons name="add" size={18} color="#94A3B8" />
              <ThemedText className="ml-1 text-sm opacity-60">Agregar Tarea</ThemedText>
            </View>
          </TouchableOpacity>
        )}

        {/* Main action buttons */}
        {!isMaintenance && !showInput && (
          <TouchableOpacity
            className="mt-3 py-3 rounded-xl items-center bg-amber-500"
            onPress={() => openInput("maintenance")}
          >
            <ThemedText className="text-white font-semibold">Enviar a Mantenimiento</ThemedText>
          </TouchableOpacity>
        )}

        {isMaintenance && !showInput && (
          <TouchableOpacity
            className="mt-3 py-3 rounded-xl items-center bg-green-500"
            onPress={() => openInput("available")}
          >
            <ThemedText className="text-white font-semibold">Marcar como Disponible</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
