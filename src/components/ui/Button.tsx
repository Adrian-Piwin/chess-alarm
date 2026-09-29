import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type IconName = ComponentProps<typeof Ionicons>['name'];

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: IconName;
  size?: 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  accessibilityHint?: string;
}

const BACKGROUND: Record<Variant, [string, string]> = {
  primary: [colors.primary, colors.primaryPressed],
  secondary: [colors.surfaceRaised, colors.border],
  ghost: ['transparent', colors.surfaceRaised],
  danger: [colors.danger, '#C4433C'],
};

const FOREGROUND: Record<Variant, string> = {
  primary: colors.primaryText,
  secondary: colors.text,
  ghost: colors.text,
  danger: colors.white,
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  size = 'md',
  disabled,
  loading,
  style,
  accessibilityHint,
}: ButtonProps) {
  const fg = FOREGROUND[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.base,
        size === 'lg' && styles.large,
        { backgroundColor: BACKGROUND[variant][pressed ? 1 : 0] },
        variant === 'primary' && styles.primaryShadow,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.row}>
          {icon ? <Ionicons name={icon} size={size === 'lg' ? 20 : 17} color={fg} /> : null}
          <Text style={[styles.label, size === 'lg' && styles.largeLabel, { color: fg }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  large: { minHeight: 54, paddingHorizontal: spacing.xl },
  // A chunky bottom edge gives buttons a tactile, "pressable" feel.
  primaryShadow: { borderBottomWidth: 3, borderBottomColor: '#3C8651' },
  pressed: { transform: [{ translateY: 1 }] },
  disabled: { opacity: 0.45 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  label: { ...typography.bodyStrong },
  largeLabel: { fontSize: 17, fontWeight: '800' },
});
