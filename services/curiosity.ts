import type { UserProfile } from '@/services/types';
import type { useChatStore } from '@/stores/chatStore';

type ChatStoreSnapshot = ReturnType<typeof useChatStore.getState>;

function noUserSharingInLast4(store: ChatStoreSnapshot) {
  return store.messages
    .filter((m) => m.role === 'user')
    .slice(-4)
    .every((m) => m.content.trim().split(/\s+/).length <= 3);
}

export function shouldFire(store: ChatStoreSnapshot): boolean {
  const state = store.curiosityState;
  const msgCount = store.messages.length;
  if (store.isEmotionalMode) return false;
  if (state.messagesSinceLastQuestion < 3) return false;
  if (store.currentMode?.toLowerCase().includes('task') || store.hasActiveTask) return false;
  if (state.lastTopicEngaged && state.messagesSinceLastQuestion >= 2) return Math.random() < 0.7;
  if (state.messagesSinceLastQuestion >= 3) return Math.random() < 0.5;
  if (msgCount > 8 && noUserSharingInLast4(store)) return Math.random() < 0.9;
  return false;
}

export function buildInstruction(store: ChatStoreSnapshot, profile: UserProfile): string {
  if (!shouldFire(store)) return '';
  const lastUser = store.messages.filter((m) => m.role === 'user').slice(-1)[0]?.content ?? '';
  return `

[CURIOSITY ENGINE - ACTIVE THIS RESPONSE]
Weave a genuine curiosity moment into this response.
- Express your opinion first, then ask theirs, or ask something that reveals who ${profile.name} is.
- Base it on current activity (${store.currentMode ?? 'none yet'}), their last message (${lastUser}), or liked topics (${store.curiosityState.recentLikedTopics.join(', ') || 'none yet'}).
- The question must reveal a value, preference, contradiction, or real opinion. Not just a fact.
- One question only. Do not make it feel like a survey.
- Stage awareness: ${
    store.progressionStage === 0
      ? 'Keep it light - you just met.'
      : store.progressionStage >= 2
        ? 'You can go deeper - trust exists.'
        : 'Moderate depth - getting there.'
  }
`;
}
