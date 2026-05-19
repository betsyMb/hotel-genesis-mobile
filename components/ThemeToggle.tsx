import { useEffect } from "react";
import { useContext } from "react";
import { useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import { NavigationContext } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/use-theme-color";

export function ThemeToggle() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const navigation = useContext(NavigationContext);
  const tintColor = useThemeColor({}, "tint");

  useEffect(() => {
    if (!navigation) return;

    navigation.setOptions({
      headerRight: () => (
        <MaterialIcons
          name={colorScheme === "dark" ? "light-mode" : "dark-mode"}
          size={24}
          color={tintColor}
          onPress={() => {
            console.log("THEME CHANGE")
          }}
          style={{ marginRight: 16 }}
        />
      ),
    });
  }, [colorScheme, tintColor, navigation, router]);

  return null;
}
