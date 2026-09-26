import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { createElement } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import type { PrepVideo } from '@/data/videos';
import { colors, fonts, radii, spacing } from '@/theme/tokens';

type VideoCardProps = {
  video: PrepVideo;
  onPress: () => void;
};

export function YoutubeFrame({ video }: { video: PrepVideo }) {
  if (Platform.OS === 'web') {
    return createElement('iframe', {
      src: `https://www.youtube.com/embed/${video.youtubeId}`,
      title: video.title,
      allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
      allowFullScreen: true,
      style: {
        width: '100%',
        height: '100%',
        border: 'none',
        display: 'block',
      },
    });
  }

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`Open ${video.title} on YouTube`}
      onPress={() => WebBrowser.openBrowserAsync(video.url)}
      style={styles.fallback}>
      <Ionicons name="play" size={32} color={colors.cream} />
    </Pressable>
  );
}

export function VideoCard({ video, onPress }: VideoCardProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <YoutubeFrame video={video} />
      </View>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={video.title}
        style={({ pressed }) => pressed && styles.pressed}>
        <Text style={styles.title}>{video.title}</Text>
        <Text style={styles.meta}>
          {video.topic} · {video.length}
        </Text>
      </Pressable>
    </View>
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
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
