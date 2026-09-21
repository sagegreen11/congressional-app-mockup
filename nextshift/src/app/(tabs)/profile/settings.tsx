import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { colors, fonts, spacing } from '@/theme/tokens';

export default function SettingsScreen() {
  return (
    <Screen>
      <View style={styles.content}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.body}>County: Bergen, New Jersey</Text>
        <Text style={styles.body}>Units: walking minutes, bus, NJ Transit rail</Text>
        <Text style={styles.body}>Language: English</Text>
        <Text style={styles.note}>Preferences will persist after accounts are added.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 32,
    color: colors.brown,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  body: {
    fontFamily: fonts.sans,
    fontSize: 16,
    color: colors.ink,
  },
  note: {
    fontFamily: fonts.sans,
    color: colors.prototype,
    marginTop: spacing.md,
  },
});
