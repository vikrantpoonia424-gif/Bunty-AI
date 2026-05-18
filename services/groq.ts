import Constants from 'expo-constants';
import { assembleSystemPrompt } from '@/services/context';
import { buildInstruction } from '@/services/curiosity';
import { detectStyle } from '@/services/personality';
import type { Message, StyleKey, UserProfile } from '@/services/types';
import type { useChatStore } from '@/stores/chatStore';

type ChatStoreSnapshot = ReturnType<typeof useChatStore.getState>;

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MAIN_MODEL = 'llama-3.3-70b-versatile';
const EXTRACTION_MODEL = 'llama-3.1-8b-instant';

function getApiKey() {
  return process.env.EXPO_PUBLIC_GROQ_API_KEY ?? Constants.expoConfig?.extra?.GROQ_API_KEY;
}

async function groqChat(body: object) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('MISSING_GROQ_API_KEY');
  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error('GROQ_API_ERROR');
  return response.json();
}

export async function sendMessage(
  userMessage: string,
  store: ChatStoreSnapshot,
  profile: UserProfile
): Promise<{ content: string; detectedStyle: StyleKey }> {
  const systemPrompt = await assembleSystemPrompt(profile, store);
  const curiosityAddition = buildInstruction(store, profile);
  const history = store.messages.slice(-20);
  const dedupedHistory =
    history[history.length - 1]?.role === 'user' && history[history.length - 1]?.content === userMessage
      ? history.slice(0, -1)
      : history;
  const contextLine = store.currentMode ? `[CONTEXT: User is currently ${store.currentMode}]\n` : '';

  const data = await groqChat({
    model: MAIN_MODEL,
    messages: [
      { role: 'system', content: systemPrompt + curiosityAddition },
      ...dedupedHistory.map((m: Message) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
      { role: 'user', content: `${contextLine}${userMessage}` }
    ],
    max_tokens: 300,
    temperature: 0.88,
    stream: false
  });

  const content = data.choices?.[0]?.message?.content?.trim() ?? 'yaar kuch atak gaya. dobara bol?';
  return { content, detectedStyle: detectStyle(content) };
}

export async function extractMemory(prompt: string): Promise<unknown> {
  const data = await groqChat({
    model: EXTRACTION_MODEL,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 600,
    temperature: 0.3
  });
  const text = data.choices?.[0]?.message?.content ?? '{"save":false}';
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch {
    return { save: false };
  }
}

export async function generateShort(prompt: string): Promise<string> {
  const data = await groqChat({
    model: MAIN_MODEL,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 90,
    temperature: 0.9
  });
  return data.choices?.[0]?.message?.content?.trim() ?? '';
}
