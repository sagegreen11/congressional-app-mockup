import { createElement } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  googleDirectionsEmbedUrl,
  googlePlaceEmbedUrl,
  type TravelMode,
} from '@/lib/google-maps';
import { colors, fonts, radii } from '@/theme/tokens';

type MapPreviewProps = {
  label?: string;
  tall?: boolean;
  query?: string;
  directions?: boolean;
  mode?: TravelMode;
};

export function MapPreview({
  label,
  tall,
  query = 'Bergen County, NJ',
  directions = false,
  mode = 'bus',
}: MapPreviewProps) {
  const src = directions ? googleDirectionsEmbedUrl(query, mode) : googlePlaceEmbedUrl(query);

  return (
    <View style={[styles.map, tall && styles.tall]}>
      {Platform.OS === 'web' ? (
        createElement('iframe', {
          src,
          title: label ?? 'Google Map',
          allowFullScreen: true,
          loading: 'lazy',
          referrerPolicy: 'no-referrer-when-downgrade',
          allow: 'geolocation',
          style: {
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
          },
        })
      ) : (
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={label ?? 'Open Google Maps'}
          onPress={() => Linking.openURL(src.replace('&output=embed', ''))}
          style={styles.fallback}>
          <Text style={styles.fallbackText}>Open Google Maps</Text>
        </Pressable>
      )}
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    height: 148,
    borderRadius: radii.md,
    backgroundColor: colors.mutedBlue,
    overflow: 'hidden',
    position: 'relative',
  },
  tall: {
    height: 220,
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.mutedBlue,
  },
  fallbackText: {
    fontFamily: fonts.sansSemibold,
    color: colors.brown,
  },
  label: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.brown,
    backgroundColor: colors.cream,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
});
