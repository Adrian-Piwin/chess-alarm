import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Screen, SettingRow } from '@/components/ui';
import { useProgressStore } from '@/store/progressStore';
import { useSettingsStore } from '@/store/settingsStore';
import { colors, radius, spacing, typography } from '@/theme';
import { BOARD_THEMES, type BoardThemeId } from '@/theme/boardThemes';

function confirm(title: string, message: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (globalThis.confirm?.(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Reset', style: 'destructive', onPress: onConfirm },
  ]);
}

export default function SettingsScreen() {
  const settings = useSettingsStore();
  const resetProgress = useProgressStore((s) => s.resetProgress);

  return (
    <Screen>
      <Text style={styles.section}>Board</Text>
      <Card style={styles.card}>
        <View style={styles.themes}>
          {(Object.keys(BOARD_THEMES) as BoardThemeId[]).map((id) => {
            const theme = BOARD_THEMES[id];
            const selected = settings.boardTheme === id;
            return (
              <Pressable
                key={id}
                onPress={() => settings.update({ boardTheme: id })}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={`${theme.name} board`}
                style={[styles.theme, selected && styles.themeSelected]}
              >
                <View style={styles.swatch}>
                  {[0, 1, 2, 3].map((i) => (
                    <View
                      key={i}
                      style={[styles.swatchCell, { backgroundColor: i === 0 || i === 3 ? theme.light : theme.dark }]}
                    />
                  ))}
                </View>
                <Text style={styles.themeName}>{theme.name}</Text>
              </Pressable>
            );
          })}
        </View>
        <SettingRow
          label="Coordinates"
          description="Show a–h and 1–8 on the board edge."
          value={settings.showCoordinates}
          onValueChange={(showCoordinates) => settings.update({ showCoordinates })}
        />
      </Card>

      <Text style={styles.section}>Feedback</Text>
      <Card style={styles.card}>
        <SettingRow
          label="Sound effects"
          description="Moves, captures, mistakes and celebrations."
          value={settings.soundEnabled}
          onValueChange={(soundEnabled) => settings.update({ soundEnabled })}
        />
        {Platform.OS !== 'web' ? (
          <SettingRow
            label="Haptics"
            description="Light vibration on moves and mistakes."
            value={settings.hapticsEnabled}
            onValueChange={(hapticsEnabled) => settings.update({ hapticsEnabled })}
          />
        ) : null}
      </Card>

      <Text style={styles.section}>Progress</Text>
      <Card style={styles.card}>
        <Text style={styles.body}>Progress is stored on this device only.</Text>
        <Button
          label="Reset all progress"
          icon="trash-outline"
          variant="danger"
          onPress={() =>
            confirm(
              'Reset all progress?',
              'Every star and level will be cleared. This cannot be undone.',
              resetProgress,
            )
          }
        />
      </Card>

      <Text style={styles.section}>About</Text>
      <Card style={styles.card}>
        <Text style={styles.body}>
          Chess Alarm — learn openings line by line, and wake up to them. Piece artwork by Colin M.L. Burnett (BSD
          licence).
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { ...typography.heading, color: colors.text, marginTop: spacing.sm },
  card: { gap: spacing.md },
  body: { ...typography.body, color: colors.textMuted, lineHeight: 21 },
  themes: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  theme: {
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeSelected: { borderColor: colors.primary },
  swatch: {
    width: 64,
    height: 64,
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  swatchCell: { width: 32, height: 32 },
  themeName: { ...typography.caption, color: colors.text },
});
