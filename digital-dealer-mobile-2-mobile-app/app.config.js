module.exports = {
  expo: {
    name: "Digital Dealer",
    slug: "digital-dealer-mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.alexium.digitaldealer"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.alexium.digitaldealer"
    },
    extra: {
      apiUrl: process.env.API_URL || 'http://172.16.20.0:3000',
      wsUrl: process.env.WS_URL || 'ws://172.16.20.0:3000',
      eas: {
        projectId: "c58ced31-90bc-41ea-8ef3-3519b0c9b0dd"
      }
    }
  }
}; 