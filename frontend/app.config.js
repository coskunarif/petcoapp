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
  notification: {
    icon: "./assets/logo.png",
    color: "#6C63FF",
    androidMode: "default"
  },
  plugins: [
    [
      "expo-notifications",
      {
        icon: "./assets/logo.png",
        color: "#6C63FF"
      }
    ]
  ],
  assetBundlePatterns: ["**/*"],
  scheme: "petcoapp", // URL scheme for deep linking
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.yourcompany.petcoapp",
    associatedDomains: ["applinks:petcoapp.supabase.co"]
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/logo.png", // Using the same logo as icon
      backgroundColor: "#6C63FF" // Using theme primary color
    },
    package: "com.yourcompany.petcoapp",
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [
          {
            scheme: "https",
            host: "*.petcoapp.supabase.co",
            pathPrefix: "/"
          }
        ],
        category: ["BROWSABLE", "DEFAULT"]
      }
    ]
  },
  extra: {
    // Explicitly expose environment variables to the app
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    EXPO_PUBLIC_EAS_PROJECT_ID: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
  }
};