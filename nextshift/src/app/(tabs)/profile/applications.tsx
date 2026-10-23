import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { colors, fonts, radii, spacing } from '@/theme/tokens';

const applications = [
  { id: 'a1', role: 'Stocker', place: 'Walmart', status: 'Submitted' },
  { id: 'a2', role: 'Store Cashier/Stocker', place: 'ALDI', status: 'In progress' },
];

export default function ApplicationsScreen() {
  return (
    <Screen>
      <View style={styles.content}>
        <Text style={styles.title}>Applications</Text>
        <Text style={styles.lede}>Sample tracker only — nothing is sent to employers.</Text>
        {applications.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.role}>{item.role}</Text>
            <Text style={styles.place}>{item.place}</Text>
            <Text style={styles.status}>{item.status}</Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 32,
    color: colors.brown,
    textAlign: 'center',
  },
  lede: {
    fontFamily: fonts.sans,
    textAlign: 'center',
    color: colors.prototype,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.mutedBlue,
  },
  role: {
    fontFamily: fonts.serif,
    fontSize: 20,
    color: colors.brown,
  },
  place: {
    fontFamily: fonts.sans,
    color: colors.ink,
  },
  status: {
    fontFamily: fonts.sansSemibold,
    color: colors.brown,
    marginTop: 4,
  },
});
