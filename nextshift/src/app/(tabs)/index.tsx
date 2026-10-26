import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

import { Screen } from '@/components/screen';
import { colors, fonts } from '@/theme/tokens';

const BROWN = colors.brown;
const BLUE = '#7EADC2';

type Hexagon = {
  cx: number;
  cy: number;
  r: number;
  color: string;
};

// Centers and radii are fractions of the home canvas. Pointy-top outlines.
const HEXAGONS: Hexagon[] = [
  { cx: 1.05, cy: 0.01, r: 0.2, color: BLUE },
  { cx: 0.55, cy: 0.11, r: 0.22, color: BROWN },
  { cx: 0.76, cy: 0.16, r: 0.22, color: BLUE },
  { cx: 0.63, cy: 0.31, r: 0.22, color: BROWN },
  { cx: 0.86, cy: 0.37, r: 0.22, color: BLUE },
  { cx: 0.78, cy: 0.44, r: 0.2, color: BROWN },
  { cx: 0.99, cy: 0.5, r: 0.2, color: BLUE },
  { cx: 0.93, cy: 0.68, r: 0.19, color: BROWN },
  { cx: 1.12, cy: 0.74, r: 0.19, color: BLUE },
];

function pointyHex(cx: number, cy: number, r: number) {
  return Array.from({ length: 6 }, (_, index) => {
    const angle = (Math.PI / 3) * index - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');
}

function HexagonField({ width, height }: { width: number; height: number }) {
  return (
    <Svg width={width} height={height} pointerEvents="none">
      {HEXAGONS.map((hex) => (
        <Polygon
          key={`${hex.cx}-${hex.cy}-${hex.color}`}
          points={pointyHex(hex.cx * width, hex.cy * height, hex.r * width)}
          fill="none"
          stroke={hex.color}
          strokeWidth={2.25}
          strokeLinejoin="miter"
        />
      ))}
    </Svg>
  );
}

function DirectionArrow() {
  return (
    <Svg width={186} height={16} viewBox="0 0 186 16">
      <Polygon points="0,7.2 166,7.2 166,8.6 0,8.6" fill={BROWN} />
      <Polygon points="160,2 184,8 160,14" fill="none" stroke={BROWN} strokeWidth={1.7} strokeLinejoin="miter" />
    </Svg>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const [canvas, setCanvas] = useState({ width: 0, height: 0 });

  return (
    <Screen
      right={
        <Pressable onPress={() => router.push('/notifications')} hitSlop={8}>
          <Ionicons name="notifications-outline" size={22} color={colors.brown} />
        </Pressable>
      }>
      <View
        style={styles.canvas}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          setCanvas({ width, height });
        }}>
        {canvas.width > 0 ? (
          <View style={styles.field} pointerEvents="none">
            <HexagonField width={canvas.width} height={canvas.height} />
          </View>
        ) : null}
        <View style={styles.copy}>
          <Text style={styles.headline}>{`Finding\nyour\nnext\ndirection`}</Text>
          <View style={styles.arrow}>
            <DirectionArrow />
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
  },
  field: {
    ...StyleSheet.absoluteFillObject,
  },
  copy: {
    position: 'absolute',
    left: 36,
    bottom: 44,
  },
  headline: {
    fontFamily: fonts.serif,
    fontSize: 52,
    lineHeight: 56,
    color: colors.brown,
    textAlign: 'center',
  },
  arrow: {
    alignItems: 'center',
    marginTop: 14,
  },
});
