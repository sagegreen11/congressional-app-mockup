import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { colors, fonts, spacing } from '@/theme/tokens';

export default function PrivacyScreen() {
  return (
    <Screen>
      <View style={styles.content}>
        <Text style={styles.title}>Privacy</Text>
        <Text style={styles.body}>
          This prototype keeps saved jobs on the device session only. Interview answers, resume drafts, and
          resource lists are mock data and are not uploaded.
        </Text>
        <Text style={styles.body}>
          Later versions will explain location, notifications, and any AI coaching before those features turn on.
        </Text>
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
  body: {
    fontFamily: fonts.sans,
    fontSize: 16,
    lineHeight: 24,
    color: colors.ink,
  },
});
