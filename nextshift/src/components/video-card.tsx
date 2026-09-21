import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { PrepVideo } from '@/data/videos';
import { colors, fonts, radii, spacing } from '@/theme/tokens';

type VideoCardProps = {
  video: PrepVideo;
  onPress: () => void;
};

export function VideoCard({ video, onPress }: VideoCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={video.title}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}>
      <View style={styles.card}>
        <Ionicons name="play" size={32} color={colors.cream} />
      </View>
      <Text style={styles.title}>{video.title}</Text>
      <Text style={styles.meta}>
        {video.topic} · {video.length}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
  },
  pressed: {
    opacity: 0.88,
  },
  card: {
    aspectRatio: 1,
    backgroundColor: colors.brown,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 14,
    color: colors.brown,
  },
  meta: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.ink,
  },
});
