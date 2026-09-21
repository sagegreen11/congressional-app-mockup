import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ShoeMark } from '@/components/shoe-mark';
import { colors, fonts, spacing } from '@/theme/tokens';

export default function HomeScreen() {
  const router = useRouter();
  const [width, setWidth] = useState(390);

  return (
    <Screen
      right={
        <Pressable onPress={() => router.push('/notifications')} hitSlop={8}>
          <Ionicons name="notifications-outline" size={22} color={colors.brown} />
        </Pressable>
      }>
      <View style={styles.canvas} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
        <View style={styles.hero}>
          <Text style={styles.headline}>{`Finding\nyour\nnext\ndirection`}</Text>
          <ShoeMark width={150} height={108} />
        </View>

        <View style={[styles.triangleWrap, { pointerEvents: 'none' }]}>
          <View
            style={[
              styles.triangle,
              {
                borderLeftWidth: width / 2 + 4,
                borderRightWidth: width / 2 + 4,
              },
            ]}
          />
        </View>

        <View style={styles.links}>
          <Pressable onPress={() => router.push('/jobs')}>
            <Text style={styles.link}>Jobs near you</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/resources')}>
            <Text style={styles.link}>Resources</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/prepare')}>
            <Text style={styles.link}>Prepare</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
  },
  hero: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    zIndex: 1,
  },
  headline: {
    fontFamily: fonts.serif,
    fontSize: 38,
    lineHeight: 42,
    color: colors.brown,
  },
  triangleWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  triangle: {
    width: 0,
    height: 0,
    borderBottomWidth: 280,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.brown,
  },
  links: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 44,
    alignItems: 'center',
    gap: 12,
    zIndex: 2,
  },
  link: {
    fontFamily: fonts.serifItalic,
    fontSize: 20,
    color: colors.cream,
  },
});
