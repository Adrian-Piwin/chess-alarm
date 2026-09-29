import { Link, Stack } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { Screen } from '@/components/ui';
import { colors, typography } from '@/theme';

export default function NotFoundScreen() {
  return (
    <Screen contentStyle={styles.center}>
      <Stack.Screen options={{ title: 'Not found' }} />
      <Text style={styles.title}>This square is empty.</Text>
      <Link href="/" style={styles.link}>
        Back to the openings
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  title: { ...typography.title, color: colors.text },
  link: { ...typography.bodyStrong, color: colors.primary },
});
