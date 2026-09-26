import { createElement } from 'react';
import { Image, Platform } from 'react-native';

const shoeSource = require('../assets/shoes.png') as number | string | { uri: string };

function webUri(source: typeof shoeSource): string {
  if (typeof source === 'string') return source;
  if (typeof source === 'object' && source && 'uri' in source) return source.uri;
  return String(source);
}

type ShoeMarkProps = {
  width?: number;
  height?: number;
};

export function ShoeMark({ width = 168, height = 118 }: ShoeMarkProps) {
  if (Platform.OS === 'web') {
    return createElement('img', {
      src: webUri(shoeSource),
      alt: '',
      style: {
        width,
        height,
        objectFit: 'contain',
        display: 'block',
      },
    });
  }

  return (
    <Image
      source={shoeSource}
      style={{ width, height }}
      resizeMode="contain"
      accessibilityLabel="NextShift shoe"
    />
  );
}
