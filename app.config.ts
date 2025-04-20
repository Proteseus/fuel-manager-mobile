import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Fuel Manager",
  slug: "fueler",
  owner: "debrye",
  version: "0.6.1",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  assetBundlePatterns: [
    "**/*"
  ],
  ios: {
    "supportsTablet": true
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/icon.png",
      backgroundColor: "#ffffff"
    },
    package: "com.lewibelayneh.fueler",
    versionCode: 1
  },
  web: {
    favicon: "./assets/icon.png",
    bundler: "metro"
  },
  plugins: [
    "expo-router"
  ],
  scheme: "fuel-manager",
  extra: {
    apiUrl: "https://api.fueler.lewibelayneh.com/api",
    router: {
      origin: false
    },
    eas: {
      projectId: "8c2a15d4-d3d6-47df-9bc7-5030b42eba0c"
    }
  }
});
