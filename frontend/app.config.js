module.exports = {
  name: "PetcoApp",
  slug: "petco-app",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/logo.png", // Corrected path
  userInterfaceStyle: "automatic",
  newArchEnabled: true, // Added missing property
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.yourcompany.petcoapp"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#FFFFFF"
    },
    package: "com.yourcompany.petcoapp"
  },
  extra: {
    // Explicitly expose environment variables to the app
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    EXPO_PUBLIC_EAS_PROJECT_ID: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
  }
};