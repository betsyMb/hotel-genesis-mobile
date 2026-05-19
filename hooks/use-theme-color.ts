import { Colors } from '@/constants/theme';
import { useTheme } from './use-theme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const { resolvedTheme } = useTheme(); // 👈 Usa resolvedTheme de tu contexto
  const theme = resolvedTheme ?? 'light'; // 'light' o 'dark'
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}