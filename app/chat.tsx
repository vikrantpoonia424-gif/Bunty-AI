import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BuntyAvatar } from '@/components/BuntyAvatar';
import { ChatBubble } from '@/components/ChatBubble';
import { ModeSelector } from '@/components/ModeSelector';
import { TypingIndicator } from '@/components/TypingIndicator';
import { colors } from '@/constants/theme';
import * as memoryService from '@/services/memory';
import * as notifications from '@/services/notifications';
import { recordLike } from '@/services/personality';
import { getLifeState, getOpeningMessage, LIFE_STATE_TEXT } from '@/services/time';
import { sendMessage } from '@/services/groq';
import { getStage } from '@/services/progression';
import type { Message } from '@/services/types';
import { useChatStore } from '@/stores/chatStore';
import { useProfileStore } from '@/stores/profileStore';

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function Chat() {
  const profile = useProfileStore((s) => s.profile);
  const chat = useChatStore();
  const [input, setInput] = useState('');
  const [showModes, setShowModes] = useState(true);
  const listRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    const activeProfile = profile;
    if (!activeProfile?.onboarding_complete) {
      router.replace('/onboarding/welcome');
      return;
    }
    let mounted = true;
    async function init(readyProfile: NonNullable<typeof activeProfile>) {
      await chat.hydrateModeFrequency();
      const memory = await memoryService.load();
      const stage = getStage(memory?.meta.sessions_count ?? 0, memory);
      const lifeState = getLifeState();
      chat.startSession(lifeState, stage, (memory?.meta.sessions_count ?? 0) + 1);
      const opener = await getOpeningMessage(readyProfile);
      if (mounted && useChatStore.getState().messages.length === 0) {
        useChatStore.getState().addMessage({ role: 'assistant', content: opener, detectedStyle: 'chill' });
      }
    }
    init(activeProfile);
    return () => {
      mounted = false;
    };
  }, []);

  if (!profile) return null;

  const handleLike = async (message: Message) => {
    chat.toggleLike(message.id);
    if (!message.liked) {
      await recordLike(message.detectedStyle ?? 'chill');
      const topic = chat.currentMode ?? message.content.slice(0, 48);
      chat.recordEngagementTopic(topic);
      await notifications.recordEngagement(topic);
    }
  };

  const handleComment = (message: Message) => {
    setInput(`re: "${message.content.slice(0, 48)}" `);
  };

  const submit = async () => {
    const text = input.trim();
    if (!text || chat.typing) return;
    setInput('');
    chat.addMessage({ role: 'user', content: text });
    chat.setTyping(true);
    const started = Date.now();
    try {
      const result = await sendMessage(text, useChatStore.getState(), profile);
      await wait(Math.max(800, 1200 - (Date.now() - started)));
      chat.addMessage({ role: 'assistant', content: result.content, detectedStyle: result.detectedStyle });
    } catch (error) {
      await wait(Math.max(800, 1200 - (Date.now() - started)));
      const missingKey = error instanceof Error && error.message === 'MISSING_GROQ_API_KEY';
      chat.addMessage({
        role: 'assistant',
        content: missingKey
          ? 'groq key missing hai. .env mein EXPO_PUBLIC_GROQ_API_KEY set kar, phir app reload kar.'
          : 'yaar internet ka scene kharab hai. thoda ruk.',
        detectedStyle: 'chill'
      });
      if (missingKey) return;
      await wait(2000);
      try {
        const result = await sendMessage(text, useChatStore.getState(), profile);
        chat.addMessage({ role: 'assistant', content: result.content, detectedStyle: result.detectedStyle });
      } catch {
        // The visible fallback above is enough for the prototype.
      }
    } finally {
      chat.setTyping(false);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.screen}>
        <View style={styles.header}>
          <BuntyAvatar lifeState={chat.sessionLifeState} />
          <View style={styles.headerText}>
            <Text style={styles.name}>Bunty</Text>
            <Text style={styles.state}>{LIFE_STATE_TEXT[chat.sessionLifeState]}</Text>
          </View>
          <TouchableOpacity accessibilityLabel="Show modes" style={styles.headerButton} onPress={() => setShowModes((v) => !v)}>
            <Ionicons name="options-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        <FlatList
          ref={listRef}
          data={chat.messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ChatBubble message={item} lifeState={chat.sessionLifeState} onLike={handleLike} onComment={handleComment} />
          )}
          ListFooterComponent={chat.typing ? <TypingIndicator /> : null}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        />

        {showModes && (
          <ModeSelector
            modeFrequency={chat.modeFrequency}
            onSelect={(mode) => {
              chat.setCurrentMode(mode);
              setShowModes(false);
            }}
          />
        )}

        <View style={styles.inputBar}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={chat.currentMode ? `bol, ${chat.currentMode.toLowerCase()} mode` : 'kya scene hai?'}
            placeholderTextColor={colors.muted}
            style={styles.input}
            multiline
          />
          <TouchableOpacity accessibilityLabel="Send message" style={styles.send} onPress={submit}>
            <Ionicons name="send" size={19} color={colors.bg} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg
  },
  screen: {
    flex: 1,
    backgroundColor: colors.bg
  },
  header: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.line
  },
  headerText: {
    flex: 1
  },
  name: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900'
  },
  state: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 2
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface
  },
  list: {
    padding: 14,
    paddingBottom: 20
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.line
  },
  input: {
    flex: 1,
    maxHeight: 120,
    minHeight: 46,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 10,
    fontSize: 16
  },
  send: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.amber
  }
});
