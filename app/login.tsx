import React, { useState, useContext } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, TextInput, Button, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { auth } from '../lib/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from './_layout';

export default function Login() {
  const router = useRouter();
  const theme = useTheme();
  const { setAuthenticated } = useContext(AuthContext);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const token = await auth.login(phone, password);
      await AsyncStorage.setItem('token', token.token);
      setAuthenticated(true);
      setTimeout(() => {
        router.replace('/');
      }, 100);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Image
          source={require('../assets/gas-pump.png')}
          style={styles.logo}
        />
        
        <Text variant="headlineLarge" style={[styles.title, { color: theme.colors.primary }]}>
          Fueler
        </Text>

        <View style={styles.form}>
          <TextInput
            mode="outlined"
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoCapitalize="none"
            autoComplete='tel-device'
            style={styles.input}
          />

          <TextInput
            mode="outlined"
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />

          {error ? (
            <Text style={[styles.error, { color: theme.colors.error }]}>
              {error}
            </Text>
          ) : null}

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            Login
          </Button>

          <Link href="/register" asChild>
            <Button
              mode="outlined"
              style={styles.button}
            >
              Create Account
            </Button>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    gap: 32,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: 'transparent',
  },
  error: {
    textAlign: 'center',
  },
  button: {
    padding: 4,
  },
});