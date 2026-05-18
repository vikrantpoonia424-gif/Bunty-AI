import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FloatingBuntyOverlay } from '@/components/FloatingBuntyOverlay';
import { colors } from '@/constants/theme';
import * as memory from '@/services/memory';
import * as notifications from '@/services/notifications';
import { useChatStore } from '@/stores/chatStore';
import { useProfileStore } from '@/stores/profileStore';

export default function RootLayout() {
  const profile = useProfileStore((s) => s.profile);

  useEffect(() => {
    useProfileStore.getState().hydrate();
    useChatStore.getState().hydrateModeFrequency();
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', async (state) => {
      if (state !== 'background' && state !== 'inactive') return;
      const chat = useChatStore.getState();
      const profile = useProfileStore.getState().profile;
      if (!profile || chat.messages.length < 10) return;
      await memory.consolidate(chat.messages, profile, chat.sessionId, chat.currentMode);
      if (!profile.permission_notifications) return;
      const stored = await memory.load();
      await notifications.scheduleSessionNotifications({
        mode: chat.currentMode,
        topicsEngaged: chat.engagedTopics,
        threads: stored?.relationship.threads ?? [],
        profile
      });
    });
    return () => sub.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg }
          }}
        />
        <FloatingBuntyOverlay enabled={!!profile?.permission_overlay} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
