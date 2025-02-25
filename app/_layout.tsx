import { useEffect, useState } from 'react';
import { Stack, useRouter, Redirect, usePathname } from 'expo-router';
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
          <ActivityIndicator size="large" />
        </View>
      </PaperProvider>
    );
  }

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await auth.logout();
      // Clear any cached API tokens
      await AsyncStorage.removeItem('token');
      // Update state before navigation
      setAuthenticated(false);
      // Replace current history with login
      router.replace({
        pathname: '/login',
        params: { redirectedFrom: pathname },
      });
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Logout failed. Please try again.');
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
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: theme.colors.background,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerRight: ({ tintColor }) => (
            authenticated && pathname !== '/login' && pathname !== '/register' ? (
              <IconButton
                icon="logout"
                iconColor={tintColor}
                onPress={handleLogout}
              />
            ) : null
          ),
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="fuel/add" />
        <Stack.Screen name="vehicle/register" />
      </Stack>
    </PaperProvider>
  );
}
