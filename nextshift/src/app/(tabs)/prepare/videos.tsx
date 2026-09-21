import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { Screen } from '@/components/screen';
import { ShoeMark } from '@/components/shoe-mark';
import { VideoCard } from '@/components/video-card';
import { prepVideos } from '@/data/videos';
import { colors, fonts, radii, spacing } from '@/theme/tokens';

export default function PrepVideosScreen() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = prepVideos.find((video) => video.id === activeId);

  return (
    <Screen>
      <View style={styles.top}>
        <ShoeMark width={110} height={78} />
        <Text style={styles.title}>Prep Videos</Text>
      </View>
      {active ? (
        <View style={styles.player}>
          <View style={styles.stage}>
            <Text style={styles.playMark}>▶</Text>
          </View>
          <Text style={styles.clipTitle}>{active.title}</Text>
          <Text style={styles.meta}>
            {active.topic} · {active.length} · playback is a placeholder
          </Text>
          <PrimaryButton label="Back to clips" tone="cream" onPress={() => setActiveId(null)} />
        </View>
      ) : (
        <View style={styles.grid}>
          {prepVideos.map((video) => (
            <View key={video.id} style={styles.cell}>
              <VideoCard video={video} onPress={() => setActiveId(video.id)} />
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    gap: 4,
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 32,
    color: colors.brown,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  cell: {
    width: '47%',
    flexGrow: 1,
  },
  player: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  stage: {
    height: 210,
    backgroundColor: colors.brown,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playMark: {
    color: colors.cream,
    fontSize: 36,
  },
  clipTitle: {
    fontFamily: fonts.serif,
    fontSize: 24,
    color: colors.brown,
  },
  meta: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.ink,
  },
});
