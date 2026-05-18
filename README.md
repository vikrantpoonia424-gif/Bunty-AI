# Bunty

Android companion prototype built with React Native + Expo Router on Expo SDK 55.

## What is included

- Full onboarding flow: boot sequence, conversational profile setup, overlay/notification permission asks, language choice.
- Main chat screen with Bunty header, life state, message actions, typing indicator, mode selector, and Groq-backed replies.
- Memory, personality, progression, curiosity, and proactive-notification services.
- Overlay permission flow plus a stubbed overlay component. The originally requested `react-native-overlay-window` package is not published on npm, so the prototype installs cleanly and leaves the native overlay bridge as the production swap-in point.
- Prompt assets in `assets/soul.md`, `assets/behavior.md`, `assets/memory.md`, and `assets/progression.md`.

## Setup

```bash
npm install
npm run start
```

Create a `.env` file before starting Expo:

```bash
EXPO_PUBLIC_GROQ_API_KEY=your_key_here
```

Expo inlines `EXPO_PUBLIC_` variables into the app bundle. For this prototype that keeps setup simple, but do not ship a production app with a private LLM key embedded in the client.

SDK 55 requires Node 20.19.x or newer. After dependency installation, run `npx expo install --check` and accept Expo's fixes if it suggests any package alignment.

This prototype uses React Native's built-in `Animated` API instead of Reanimated so it can install cleanly with React Native 0.83.x.

For APK:

```bash
npm run build:apk
```

The preview EAS profile builds an Android APK.

## Notes

The current avatar is a built-in visual placeholder so the app runs without external art. When final avatar images are ready, place them under `assets/avatars/` and replace `components/BuntyAvatar.tsx` with image selection from the life-state pools.

In Expo Go, the floating orb appears only inside the Bunty app. A true Android chat-head that floats over other apps requires a development build/APK with a native `SYSTEM_ALERT_WINDOW` overlay module; Expo Go cannot load custom native overlay code.
