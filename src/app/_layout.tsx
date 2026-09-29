import { DarkTheme, Stack, ThemeProvider, useRootNavigationState, type Theme } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BannerHost } from '@/components/BannerHost';
import { useAlarmRouting } from '@/features/alarm/useAlarmRouting';
import { useHydrated } from '@/store/useHydrated';
import { colors } from '@/theme';

const NAV_THEME: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.background,
    text: colors.text,
    border: colors.border,
  },
};

export default function RootLayout() {
  const hydrated = useHydrated();
  const navigationReady = Boolean(useRootNavigationState()?.key);
  useAlarmRouting(hydrated && navigationReady);

  return (
    <SafeAreaProvider>
      <ThemeProvider value={NAV_THEME}>
        <StatusBar style="light" />
        {hydrated ? (
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.text,
              headerTitleStyle: { fontWeight: '700' },
              headerShadowVisible: false,
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Openings' }} />
            <Stack.Screen name="opening/[id]" options={{ title: '' }} />
            <Stack.Screen name="train/[openingId]/[lineId]" options={{ title: 'Study' }} />
            <Stack.Screen
              name="alarm"
              options={{
                headerShown: false,
                gestureEnabled: false,
                presentation: 'fullScreenModal',
                animation: 'fade',
              }}
            />
          </Stack>
        ) : (
          <View style={styles.splash} />
        )}
        <BannerHost />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({ splash: { flex: 1, backgroundColor: colors.background } });
