export type LanguagePref = 'hinglish' | 'english';
export type MessageRole = 'user' | 'assistant';
export type StyleKey = 'savage' | 'chill' | 'hype' | 'conspiracy';
export type LifeState = 'workout' | 'eating' | 'chilling';
export type TimeSlot = 'morning' | 'midday' | 'afternoon' | 'evening' | 'night' | 'latenight';
export type ProgressionStage = 0 | 1 | 2 | 3;

export interface UserProfile {
  name: string;
  age: number;
  intro?: string | null;
  language_pref: LanguagePref;
  permission_overlay: boolean;
  permission_notifications: boolean;
  onboarding_complete: boolean;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  liked?: boolean;
  detectedStyle?: StyleKey;
  replyToId?: string;
}

export interface KnownFact {
  fact: string;
  signal_type: 'preference' | 'value' | 'life_context' | 'contradiction' | 'inside_moment' | 'strong_opinion';
  confidence: 'high' | 'medium';
  how_revealed: 'direct' | 'implied' | 'contradiction';
  added_session: number;
}

export interface Thread {
  description: string;
  follow_up: string;
  added_session: number;
  resolved: boolean;
}

export interface BuntyMemory {
  meta: { version: number; sessions_count: number; last_updated: string };
  user: {
    name: string;
    age: number;
    gender?: string | null;
    intro?: string | null;
    language_pref: LanguagePref;
    life_phase?: string | null;
    known_facts: KnownFact[];
  };
  relationship: {
    threads: Thread[];
    inside_moments: string[];
    relationship_note: string;
    emotional_history: string;
  };
  content_signals: {
    topics_that_engaged: string[];
    strong_opinions: string[];
    content_preferences?: Record<string, string[]>;
  };
}

export interface SessionSummary {
  session_id: number;
  date: string;
  duration_minutes?: number;
  mode: string;
  key_topics: string[];
  emotional_register: string;
  notable_exchange?: string;
  threads_opened: string[];
  threads_closed?: string[];
}

export interface CuriosityState {
  messagesSinceLastQuestion: number;
  lastTopicEngaged: string | null;
  recentLikedTopics: string[];
}
