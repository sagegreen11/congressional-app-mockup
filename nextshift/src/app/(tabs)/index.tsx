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
          <ShoeMark width={188} height={136} />
        </View>

        <View style={styles.triangleWrap}>
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
    paddingTop: 28,
    zIndex: 1,
  },
  headline: {
    fontFamily: fonts.serif,
    fontSize: 54,
    lineHeight: 58,
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
});
