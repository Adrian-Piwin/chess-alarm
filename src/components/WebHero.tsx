/**
 * Landing hero shown at the top of the catalogue on the web. Explains the
 * product and advertises the mobile app, which is where the alarm lives.
 */
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { MiniBoard } from '@/components/board/MiniBoard';
import { colors, radius, spacing, typography } from '@/theme';

const HERO_LINE = ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3', 'Nf6', 'd4'];

export function WebHero() {
  const { width } = useWindowDimensions();
  const wide = width >= 860;
  return (
    <View style={[styles.hero, wide && styles.heroWide]}>
      <View style={styles.copy}>
        <Text style={styles.kicker}>CHESS ALARM</Text>
        <Text style={[styles.title, wide && styles.titleWide]}>Wake up to your openings.</Text>
        <Text style={styles.subtitle}>
          Learn 20+ openings line by line: watch, play it guided, then prove it from memory. Earn three stars on every
          line to master it.
        </Text>
        <View style={styles.appCallout}>
          <Ionicons name="alarm" size={22} color={colors.accent} />
          <Text style={styles.appText}>
            <Text style={styles.appStrong}>Get the mobile app</Text> for the wake-up alarm: it only switches off once
            you&apos;ve played your line. Coming to iOS and Android.
          </Text>
        </View>
        <View style={styles.badges}>
          <StoreBadge icon="logo-apple" label="App Store" />
          <StoreBadge icon="logo-google-playstore" label="Google Play" />
        </View>
      </View>
      {wide ? <MiniBoard moves={HERO_LINE} size={280} orientation="w" /> : null}
    </View>
  );
}

function StoreBadge({ icon, label }: { icon: 'logo-apple' | 'logo-google-playstore'; label: string }) {
  return (
    <View style={styles.badge} accessibilityLabel={`${label} — coming soon`}>
      <Ionicons name={icon} size={18} color={colors.text} />
      <View>
        <Text style={styles.badgeSmall}>Coming soon to</Text>
        <Text style={styles.badgeLabel}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.xl,
  },
  heroWide: { flexDirection: 'row', alignItems: 'center', padding: spacing.xxl },
  copy: { flex: 1, gap: spacing.md },
  kicker: { ...typography.caption, color: colors.primary, letterSpacing: 2, fontWeight: '800' },
  title: { ...typography.display, color: colors.text },
  titleWide: { fontSize: 44, lineHeight: 50 },
  subtitle: { ...typography.body, color: colors.textMuted, fontSize: 17, lineHeight: 25, maxWidth: 560 },
  appCallout: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
    padding: spacing.md,
    maxWidth: 560,
  },
  appText: { ...typography.body, color: colors.textMuted, flex: 1, lineHeight: 21 },
  appStrong: { color: colors.text, fontWeight: '700' },
  badges: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  badgeSmall: { ...typography.caption, fontSize: 10, color: colors.textFaint },
  badgeLabel: { ...typography.bodyStrong, color: colors.text },
});
