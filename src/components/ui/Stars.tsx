import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { MAX_STARS } from '@/domain/progress';
import { colors } from '@/theme';

interface StarsProps {
  count: number;
  max?: number;
  size?: number;
}

export function Stars({ count, max = MAX_STARS, size = 16 }: StarsProps) {
  return (
    <View style={styles.row} accessibilityLabel={`${count} of ${max} stars`} accessible>
      {Array.from({ length: max }, (_, i) => (
        <Ionicons
          key={i}
          name={i < count ? 'star' : 'star-outline'}
          size={size}
          color={i < count ? colors.accent : colors.textFaint}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', gap: 2 } });
