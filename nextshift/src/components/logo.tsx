import { createElement } from 'react';
import { Image, Platform, StyleSheet } from 'react-native';

const logoSource = require('../assets/logo.png') as number | string | { uri: string };

function webUri(source: typeof logoSource): string {
  if (typeof source === 'string') return source;
  if (typeof source === 'object' && source && 'uri' in source) return source.uri;
  return String(source);
}

export function Logo() {
  if (Platform.OS === 'web') {
    return createElement('img', {
      src: webUri(logoSource),
      alt: 'nextshift',
      style: {
        width: 118,
        height: 32,
        objectFit: 'contain',
        display: 'block',
      },
    });
  }

  return <Image source={logoSource} style={styles.image} resizeMode="contain" accessibilityLabel="nextshift" />;
}

const styles = StyleSheet.create({
  image: {
    width: 118,
    height: 32,
  },
});
