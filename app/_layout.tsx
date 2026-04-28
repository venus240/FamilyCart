import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View, Platform } from 'react-native';
import 'react-native-reanimated';
import '../global.css';

import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { FamilyProvider, useFamily } from '@/contexts/family-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { isLoading: authLoading, session } = useAuth();
  const { isLoading: familyLoading, family } = useFamily();
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const router = useRouter();

  const isLoading = authLoading || (session ? familyLoading : false);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inFamilyGroup = segments[0] === '(family)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login' as any);
    } else if (session && !family && !inFamilyGroup) {
      router.replace('/(family)/setup' as any);
    } else if (session && family && inAuthGroup) {
      router.replace('/(tabs)' as any);
    }
  }, [session, family, segments, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' }}>
        <ActivityIndicator size="large" color="#ff8e9d" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(family)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="add-item" options={{ presentation: 'modal' }} />
        <Stack.Screen name="mark-bought" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <FamilyProvider>
        <RootNavigator />
      </FamilyProvider>
    </AuthProvider>
  );
}
