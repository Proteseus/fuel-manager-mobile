import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
  },
});
