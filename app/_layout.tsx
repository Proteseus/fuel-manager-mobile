import { useEffect, useState } from 'react';
import { Stack, useRouter, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PaperProvider, MD3DarkTheme, MD3LightTheme, adaptNavigationTheme, IconButton } from 'react-native-paper';
import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import React from 'react';
import { auth } from '../lib/auth';

const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

const CombinedDefaultTheme = {
  ...MD3LightTheme,
  ...LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...LightTheme.colors,
    primary: '#2563eb',
    secondary: '#9333ea',
  },
  fonts: {
    ...MD3LightTheme.fonts,
    headlineMedium: {
      fontFamily: 'Roboto',
      fontWeight: '500',
      fontSize: 28,
      lineHeight: 36,
      letterSpacing: 0,
    },
  },
};

const CombinedDarkTheme = {
  ...MD3DarkTheme,
  ...DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...DarkTheme.colors,
    primary: '#60a5fa',
    secondary: '#a855f7',
  },
  fonts: {
    ...MD3DarkTheme.fonts,
    headlineMedium: {
      fontFamily: 'Roboto',
      fontWeight: '500',
      fontSize: 28,
      lineHeight: 36,
      letterSpacing: 0,
    },
  },
};

export default function RootLayout() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const theme = colorScheme === 'dark' ? CombinedDarkTheme : CombinedDefaultTheme;
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        setAuthenticated(!!token);
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!loading && !authenticated && !['/login', '/register'].includes(pathname)) {
      router.replace('/login');
    }
  }, [loading, authenticated, pathname]);

  if (loading) {
    return (
      <PaperProvider theme={theme}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </PaperProvider>
    );
  }

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await auth.logout();
      setAuthenticated(false);
      router.replace('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <PaperProvider theme={theme}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.elevation.level2,
          },
          headerTintColor: theme.colors.onSurface,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerRight: () => (
            authenticated && pathname !== '/login' && pathname !== '/register' ? (
              <IconButton
                icon={logoutLoading ? "loading" : "logout"}
                iconColor={theme.colors.onSurface}
                disabled={logoutLoading}
                onPress={handleLogout}
              />
            ) : null
          ),
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{
            title: 'Fuel Manager',
            headerLargeTitle: true,
          }}
        />
        <Stack.Screen 
          name="login"
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="register"
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="fuel/add"
          options={{
            title: 'Add Fuel Record',
            presentation: 'modal'
          }}
        />
        <Stack.Screen 
          name="vehicle/register"
          options={{
            title: 'Register Vehicle',
            presentation: 'modal'
          }}
        />
      </Stack>
    </PaperProvider>
  );
}