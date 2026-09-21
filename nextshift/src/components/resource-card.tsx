import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import type { CommunityResource } from '@/data/resources';
import { colors, fonts, radii, spacing } from '@/theme/tokens';

type ResourceCardProps = {
  resource: CommunityResource;
  onDirections: () => void;
};

export function ResourceCard({ resource, onDirections }: ResourceCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{resource.name}</Text>
      <Text style={styles.address}>{resource.address}</Text>
      <Text style={styles.body}>{resource.description}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.meta}>{resource.hours}</Text>
        <Text style={styles.meta}>{resource.phone}</Text>
      </View>
      <Text style={styles.prototype}>Prototype listing · not a live provider record</Text>
      <PrimaryButton label="Get Directions" onPress={onDirections} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cream,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: 6,
  },
  name: {
    fontFamily: fonts.serif,
    fontSize: 20,
    color: colors.brown,
  },
  address: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.ink,
  },
  body: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  meta: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.brown,
  },
  prototype: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.prototype,
    marginBottom: 4,
  },
});
