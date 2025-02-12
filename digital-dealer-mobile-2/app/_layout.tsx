import '../global.css';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
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
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <SafeAreaView style={{ flex: 1 }}>
          <Stack 
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: 'white' },
              animation: 'slide_from_right',
              animationDuration: 200,
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="login/index" />
            <Stack.Screen name="dealerships/index" />
            <Stack.Screen name="home" />
            <Stack.Screen name="customer-details/edit/index"
              options={{
                animation: 'slide_from_right',
                animationDuration: 200,
              }} />
            <Stack.Screen 
              name="customer-details/index" 
              options={{
                animation: 'simple_push',
                animationDuration: 200,
              }}
            />
            <Stack.Screen name="customer-log/index"
              options={{
                animation: 'slide_from_bottom',
                animationDuration: 200,
              }}
            />
            <Stack.Screen 
              name="qr-scanner/index"
              options={{
                animation: 'slide_from_bottom',
                animationDuration: 200,
              }}
            />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </SafeAreaView>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
