export default {
  name: 'Bunty',
  slug: 'bunty',
  scheme: 'bunty',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'dark',
  splash: {
    backgroundColor: '#0f0a04'
  },
  plugins: ['expo-router', 'expo-notifications'],
  extra: {
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    eas: {
      projectId: process.env.EAS_PROJECT_ID
    }
  },
  android: {
    package: 'com.bunty.companion',
    permissions: [
      'SYSTEM_ALERT_WINDOW',
      'RECEIVE_BOOT_COMPLETED',
      'VIBRATE',
      'POST_NOTIFICATIONS'
    ]
  }
};
