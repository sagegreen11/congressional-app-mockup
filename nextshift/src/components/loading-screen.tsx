import { createElement, useEffect, useRef } from 'react';
import { Animated, Easing, Image, Platform, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/theme/tokens';

const logoSource = require('../assets/logo.png') as number | string | { uri: string };

function webUri(source: typeof logoSource): string {
  if (typeof source === 'string') return source;
  if (typeof source === 'object' && source && 'uri' in source) return source.uri;
  return String(source);
}

type LoadingScreenProps = {
  onFinished: () => void;
};

export function LoadingScreen({ onFinished }: LoadingScreenProps) {
  const progress = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 1800,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) onFinished();
    });
  }, []);

  const fillWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.screen} accessibilityRole="progressbar" accessibilityLabel="Loading nextshift">
      <View style={styles.center}>
        {Platform.OS === 'web' ? (
          createElement('img', {
            src: webUri(logoSource),
            alt: 'nextshift',
            style: {
              width: 248,
              height: 92,
              objectFit: 'contain',
              display: 'block',
              marginBottom: 28,
            },
          })
        ) : (
          <Image source={logoSource} style={styles.logo} resizeMode="contain" accessibilityLabel="nextshift" />
        )}
        <View style={styles.track}>
          <Animated.View style={[styles.fill, { width: fillWidth }]} />
        </View>
        <Text style={styles.tagline}>looking for the next steps...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: colors.cream,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
    gap: 18,
  },
  logo: {
    width: 248,
    height: 92,
    marginBottom: 28,
  },
  track: {
    width: 176,
    height: 16,
    borderRadius: 999,
    backgroundColor: '#D7E4EA',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.blue,
  },
  tagline: {
    fontFamily: fonts.serifItalic,
    fontSize: 18,
    color: colors.brown,
    textAlign: 'center',
  },
});
