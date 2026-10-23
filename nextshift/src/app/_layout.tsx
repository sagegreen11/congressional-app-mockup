import { DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold } from '@expo-google-fonts/dm-sans';
import { PlayfairDisplay_400Regular_Italic, PlayfairDisplay_500Medium, PlayfairDisplay_600SemiBold } from '@expo-google-fonts/playfair-display';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';

import { LoadingScreen } from '@/components/loading-screen';
import { PhoneShell } from '@/components/phone-shell';
import { SavedProvider } from '@/context/saved-context';
import { colors } from '@/theme/tokens';
import '@/global.css';

SplashScreen.preventAutoHideAsync();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.cream,
    card: colors.cream,
    primary: colors.brown,
    text: colors.brown,
    border: colors.mutedBlue,
  },
};

export default function RootLayout() {
  const [booted, setBooted] = useState(false);
  const [loaded] = useFonts({
    PlayfairDisplay_400Regular_Italic,
    PlayfairDisplay_500Medium,
    PlayfairDisplay_600SemiBold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    ...Ionicons.font,
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SavedProvider>
      <ThemeProvider value={navTheme}>
        <StatusBar style="dark" />
        <PhoneShell>
          {booted ? (
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.cream } }}>
              <Stack.Screen name="(tabs)" />
            </Stack>
          ) : (
            <LoadingScreen onFinished={() => setBooted(true)} />
          )}
        </PhoneShell>
      </ThemeProvider>
    </SavedProvider>
  );
}
