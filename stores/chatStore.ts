import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import type { CuriosityState, LifeState, Message, ProgressionStage, StyleKey } from '@/services/types';

const MODE_FREQUENCY_KEY = 'mode_frequency';

interface ChatState {
  messages: Message[];
  currentMode: string | null;
  modeFrequency: Record<string, number>;
  sessionLifeState: LifeState;
  typing: boolean;
  engagedTopics: string[];
  progressionStage: ProgressionStage;
  sessionId: number;
  hasActiveTask: boolean;
  isEmotionalMode: boolean;
  curiosityState: CuriosityState;
  hydrateModeFrequency: () => Promise<void>;
  startSession: (lifeState: LifeState, stage: ProgressionStage, sessionId: number) => void;
  addMessage: (message: Omit<Message, 'id' | 'createdAt'>) => Message;
  toggleLike: (messageId: string) => void;
  setTyping: (typing: boolean) => void;
  setCurrentMode: (mode: string) => Promise<void>;
  markCuriosityAsked: () => void;
  recordEngagementTopic: (topic: string) => void;
  clearSession: () => void;
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  currentMode: null,
  modeFrequency: {},
  sessionLifeState: 'chilling',
  typing: false,
  engagedTopics: [],
  progressionStage: 0,
  sessionId: 1,
  hasActiveTask: false,
  isEmotionalMode: false,
  curiosityState: {
    messagesSinceLastQuestion: 0,
    lastTopicEngaged: null,
    recentLikedTopics: []
  },
  hydrateModeFrequency: async () => {
    const raw = await AsyncStorage.getItem(MODE_FREQUENCY_KEY);
    set({ modeFrequency: raw ? JSON.parse(raw) : {} });
  },
  startSession: (lifeState, stage, sessionId) => {
    set({
      sessionLifeState: lifeState,
      progressionStage: stage,
      sessionId,
      typing: false,
      currentMode: null,
      engagedTopics: [],
      curiosityState: {
        messagesSinceLastQuestion: 0,
        lastTopicEngaged: null,
        recentLikedTopics: []
      }
    });
  },
  addMessage: (message) => {
    const next: Message = { ...message, id: makeId(), createdAt: new Date().toISOString() };
    const emotional = /stressed|sad|bura|anxious|overwhelmed|depressed|breakup|hurt|cry|panic/i.test(message.content);
    const task = /help me|write|draft|plan|find|solve|task/i.test(message.content);
    set((state) => ({
      messages: [...state.messages, next],
      isEmotionalMode: state.isEmotionalMode || emotional,
      hasActiveTask: state.hasActiveTask || task,
      curiosityState: {
        ...state.curiosityState,
        messagesSinceLastQuestion: state.curiosityState.messagesSinceLastQuestion + (message.role === 'assistant' ? 1 : 0)
      }
    }));
    return next;
  },
  toggleLike: (messageId) => {
    set((state) => ({
      messages: state.messages.map((message) =>
        message.id === messageId ? { ...message, liked: !message.liked } : message
      )
    }));
  },
  setTyping: (typing) => set({ typing }),
  setCurrentMode: async (mode) => {
    const trimmed = mode.trim();
    const modeFrequency = { ...get().modeFrequency, [trimmed]: (get().modeFrequency[trimmed] ?? 0) + 1 };
    set({ currentMode: trimmed, modeFrequency });
    await AsyncStorage.setItem(MODE_FREQUENCY_KEY, JSON.stringify(modeFrequency));
  },
  markCuriosityAsked: () => {
    set((state) => ({
      curiosityState: { ...state.curiosityState, messagesSinceLastQuestion: 0 }
    }));
  },
  recordEngagementTopic: (topic) => {
    const clean = topic.trim().slice(0, 60);
    if (!clean) return;
    set((state) => ({
      engagedTopics: Array.from(new Set([...state.engagedTopics, clean])).slice(-10),
      curiosityState: {
        ...state.curiosityState,
        lastTopicEngaged: clean,
        recentLikedTopics: Array.from(new Set([...state.curiosityState.recentLikedTopics, clean])).slice(-5)
      }
    }));
  },
  clearSession: () => set({ messages: [], currentMode: null, typing: false })
}));
