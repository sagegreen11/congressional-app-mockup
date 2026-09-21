import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { notifications } from '@/data/notifications';
import { colors, fonts, radii, spacing } from '@/theme/tokens';

export default function NotificationCenterScreen() {
  const router = useRouter();

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Notification Center</Text>
        {notifications.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.radio} />
            <View style={styles.copy}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
            <Pressable onPress={() => router.push('/jobs')} style={styles.button}>
              <Text style={styles.buttonLabel}>Open</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
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
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.mutedBlue,
  },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.brown,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    fontFamily: fonts.sansSemibold,
    color: colors.brown,
  },
  body: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.ink,
  },
  time: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.prototype,
  },
  button: {
    backgroundColor: colors.blue,
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  buttonLabel: {
    fontFamily: fonts.sansSemibold,
    color: colors.brown,
    fontSize: 13,
  },
});
