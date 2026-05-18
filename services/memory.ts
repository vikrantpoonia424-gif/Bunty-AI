import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BuntyMemory, Message, SessionSummary, UserProfile } from '@/services/types';

const MEMORY_KEY = 'bunty_memory';
const SESSION_KEY = 'session_log';

interface ExtractionResult {
  save: boolean;
  new_facts?: BuntyMemory['user']['known_facts'];
  threads?: Array<{ description: string; follow_up: string }>;
  inside_moments?: string[];
  relationship_note?: string;
}

export async function load(): Promise<BuntyMemory | null> {
  const raw = await AsyncStorage.getItem(MEMORY_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function save(memory: BuntyMemory): Promise<void> {
  const existing = await AsyncStorage.getItem(MEMORY_KEY);
  if (existing) {
    const prev = JSON.parse(existing);
    await AsyncStorage.setItem(`${MEMORY_KEY}_v${prev.meta.version}`, existing);
  }
  await AsyncStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
}

export async function loadLastSession(): Promise<SessionSummary | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  const sessions: SessionSummary[] = JSON.parse(raw);
  return sessions[sessions.length - 1] ?? null;
}

export async function loadSessionLog(): Promise<SessionSummary[]> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function createDefaultMemory(profile: UserProfile): BuntyMemory {
  return {
    meta: { version: 1, sessions_count: 0, last_updated: new Date().toISOString() },
    user: {
      name: profile.name,
      age: profile.age,
      gender: null,
      intro: profile.intro,
      language_pref: profile.language_pref,
      life_phase: null,
      known_facts: []
    },
    relationship: {
      threads: [],
      inside_moments: [],
      relationship_note: '',
      emotional_history: ''
    },
    content_signals: {
      topics_that_engaged: [],
      strong_opinions: [],
      content_preferences: { sports: [], shows: [], music: [], other: [] }
    }
  };
}

function buildExtractionPrompt(conversation: Message[], profile: UserProfile) {
  return `You are analyzing a conversation between Bunty and ${profile.name} (age ${profile.age}).

Your job: extract only the strongest, most meaningful signals about who ${profile.name} is.

Think like a psychologist watching a friendship form. Look for:
- What this person actually cares about beneath what they say.
- Strong opinions, contradictions, active life context, emotional moments, inside moments, and ongoing threads.

Do not extract generic facts, small talk, weak guesses, or repeated known info.
If nothing strong enough happened, return {"save": false}.

Output strict JSON only:
{
  "save": true,
  "new_facts": [
    {
      "fact": "natural sentence",
      "signal_type": "preference|value|life_context|contradiction|inside_moment|strong_opinion",
      "confidence": "high|medium",
      "how_revealed": "direct|implied|contradiction"
    }
  ],
  "threads": [
    { "description": "what is ongoing", "follow_up": "what Bunty should ask next time" }
  ],
  "inside_moments": ["description of a shared joke or bit"],
  "relationship_note": "one sentence on how Bunty should approach this person going forward"
}

Conversation:
${conversation.map((m) => `${m.role === 'user' ? profile.name : 'Bunty'}: ${m.content}`).join('\n')}`;
}

async function saveSessionSummary(conversation: Message[], sessionId: number, profile: UserProfile, mode: string | null) {
  const sessions = await loadSessionLog();
  const userLines = conversation.filter((m) => m.role === 'user').map((m) => m.content);
  const summary: SessionSummary = {
    session_id: sessionId,
    date: new Date().toISOString(),
    mode: mode ?? 'not set',
    key_topics: userLines.slice(-4).map((line) => line.slice(0, 80)),
    emotional_register: /stressed|sad|bura|anxious|overwhelmed|hurt/i.test(userLines.join(' '))
      ? 'personal or emotionally weighted'
      : 'mostly light',
    notable_exchange: conversation.slice(-2).map((m) => m.content).join(' / ').slice(0, 180),
    threads_opened: []
  };
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify([...sessions.slice(-4), summary]));
  await AsyncStorage.setItem(`last_session_profile_${profile.name}`, String(sessionId));
}

export async function consolidate(
  conversation: Message[],
  profile: UserProfile,
  sessionId: number,
  mode: string | null
): Promise<void> {
  if (conversation.length < 10) return;
  const { extractMemory } = await import('@/services/groq');
  const result = (await extractMemory(buildExtractionPrompt(conversation, profile))) as ExtractionResult;
  await saveSessionSummary(conversation, sessionId, profile, mode);
  if (!result.save) return;

  const existing = (await load()) ?? createDefaultMemory(profile);
  const existingFacts = new Set(existing.user.known_facts.map((fact) => fact.fact));
  const newFacts =
    result.new_facts
      ?.filter((fact) => !existingFacts.has(fact.fact))
      .map((fact) => ({ ...fact, added_session: sessionId })) ?? [];

  existing.user.known_facts = [...existing.user.known_facts, ...newFacts];
  existing.relationship.threads = [
    ...existing.relationship.threads,
    ...(result.threads ?? []).map((thread) => ({ ...thread, added_session: sessionId, resolved: false }))
  ];
  existing.relationship.inside_moments = [
    ...existing.relationship.inside_moments,
    ...(result.inside_moments ?? [])
  ].slice(-10);
  if (result.relationship_note) existing.relationship.relationship_note = result.relationship_note;
  existing.meta.version += 1;
  existing.meta.sessions_count += 1;
  existing.meta.last_updated = new Date().toISOString();
  await save(existing);
}
