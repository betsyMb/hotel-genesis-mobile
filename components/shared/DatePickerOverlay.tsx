import { useState, useEffect } from "react";
import { View, TouchableOpacity, Platform } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { ThemedText } from "@/components/ThemedText";

export function DatePickerOverlay({ date, onChange, onClose }: {
  date: Date;
  onChange: (d: Date) => void;
  onClose: () => void;
}) {
  const [currentDate, setCurrentDate] = useState(date);
  const [step, setStep] = useState<'date' | 'time'>('date');

  useEffect(() => { setCurrentDate(date); }, [date]);

  function handleChange(event: DateTimePickerEvent, selectedDate?: Date) {
    if (Platform.OS === 'android') {
      if (event.type === 'dismissed') {
        onClose();
        return;
      }
      if (step === 'date') {
        setCurrentDate(selectedDate || currentDate);
        setStep('time');
      } else {
        const updated = new Date(currentDate);
        if (selectedDate) {
          updated.setHours(selectedDate.getHours());
          updated.setMinutes(selectedDate.getMinutes());
        }
        onChange(updated);
        onClose();
        setStep('date');
      }
    } else {
      if (selectedDate) {
        setCurrentDate(selectedDate);
        onChange(selectedDate);
      }
    }
  }

  function handleDone() {
    if (Platform.OS === 'android') return;
    onChange(currentDate);
    onClose();
  }

  if (Platform.OS === 'android') {
    return (
      <DateTimePicker
        value={currentDate}
        mode={step === 'time' ? 'time' : 'date'}
        onChange={handleChange}
      />
    );
  }

  return (
    <View className="absolute inset-0 z-50 justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <TouchableOpacity className="absolute inset-0" activeOpacity={1} onPress={onClose} />
      <View className="mx-6 bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
        <View className="flex-row justify-between items-center px-5 pt-4 pb-2">
          <TouchableOpacity onPress={onClose}>
            <ThemedText className="text-red-500 font-semibold">Cancelar</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDone}>
            <ThemedText className="text-[#0EA5E9] font-semibold">OK</ThemedText>
          </TouchableOpacity>
        </View>
        <DateTimePicker
          value={currentDate}
          mode="datetime"
          display="spinner"
          onChange={handleChange}
          locale="es-ES"
        />
      </View>
    </View>
  );
}
