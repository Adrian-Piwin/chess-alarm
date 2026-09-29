import type { ReactNode } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { colors, spacing, typography } from '@/theme';

interface SettingRowProps {
  label: string;
  description?: string;
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  right?: ReactNode;
}

export function SettingRow({ label, description, value, onValueChange, right }: SettingRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <Text style={styles.label}>{label}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      {right ??
        (onValueChange ? (
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ true: colors.primary, false: colors.border }}
            thumbColor={colors.white}
            accessibilityLabel={label}
          />
        ) : null)}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  text: { flex: 1, gap: 2 },
  label: { ...typography.bodyStrong, color: colors.text },
  description: { ...typography.caption, color: colors.textMuted },
});
