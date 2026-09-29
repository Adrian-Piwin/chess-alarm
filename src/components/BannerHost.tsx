/**
 * Renders celebration banners ("Line mastered!") at the top of the screen,
 * one at a time, sliding in and auto-dismissing.
 */
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState, type ComponentProps } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBannerStore, type BannerTone } from '@/store/bannerStore';
import { colors, radius, spacing, typography } from '@/theme';

const VISIBLE_MS = 3600;
const useNativeDriver = Platform.OS !== 'web';

const TONES: Record<BannerTone, { icon: ComponentProps<typeof Ionicons>['name']; color: string }> = {
  success: { icon: 'checkmark-circle', color: colors.primary },
  star: { icon: 'star', color: colors.accent },
  mastered: { icon: 'trophy', color: colors.accent },
  info: { icon: 'information-circle', color: colors.info },
};

export function BannerHost() {
  const banner = useBannerStore((s) => s.queue[0]);
  const dismiss = useBannerStore((s) => s.dismiss);
  const insets = useSafeAreaInsets();
  const [translate] = useState(() => new Animated.Value(-160));

  useEffect(() => {
    if (!banner) return;
    translate.setValue(-160);
    Animated.spring(translate, { toValue: 0, useNativeDriver, friction: 7 }).start();
    const timer = setTimeout(() => {
      Animated.timing(translate, { toValue: -160, duration: 220, useNativeDriver }).start(() => dismiss(banner.id));
    }, VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [banner, dismiss, translate]);

  if (!banner) return null;
  const tone = TONES[banner.tone];

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.wrap, { top: insets.top + spacing.sm, transform: [{ translateY: translate }] }]}
    >
      <Pressable
        onPress={() => dismiss(banner.id)}
        style={[styles.banner, { borderColor: tone.color }]}
        accessibilityRole="alert"
        accessibilityLabel={`${banner.title}. ${banner.message ?? ''}`}
      >
        <View style={[styles.icon, { backgroundColor: tone.color }]}>
          <Ionicons name={tone.icon} size={22} color={colors.background} />
        </View>
        <View style={styles.text}>
          <Text style={styles.title}>{banner.title}</Text>
          {banner.message ? <Text style={styles.message}>{banner.message}</Text> : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: 100, paddingHorizontal: spacing.lg },
  banner: {
    width: '100%',
    maxWidth: 480,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    backgroundColor: colors.surfaceRaised,
    shadowColor: colors.black,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 2 },
  title: { ...typography.heading, color: colors.text },
  message: { ...typography.caption, color: colors.textMuted },
});
