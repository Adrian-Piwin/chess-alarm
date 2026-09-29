import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { useSettingsStore } from '@/store/settingsStore';

type Kind = 'tap' | 'success' | 'error';

/** Light haptic feedback on native; a no-op on web. */
export function haptic(kind: Kind): void {
  if (Platform.OS === 'web' || !useSettingsStore.getState().hapticsEnabled) return;
  const run =
    kind === 'tap'
      ? Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      : Haptics.notificationAsync(
          kind === 'success' ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error,
        );
  run.catch(() => undefined);
}
