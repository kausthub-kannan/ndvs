import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/theme';

/**
 * Returns the full colour palette for the active colour scheme.
 * Defaults to 'dark' when the scheme is undetermined.
 *
 * Usage:
 *   const colors = useColors();
 *   <View style={{ backgroundColor: colors.surface }} />
 */
export function useColors() {
  const { colorScheme } = useColorScheme();
  return Colors[colorScheme ?? 'dark'];
}
