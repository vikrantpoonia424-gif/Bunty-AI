import soulAsset from '@/assets/soul.md';
import behaviorAsset from '@/assets/behavior.md';
import { loadAssetText } from '@/services/assetText';
import * as memoryService from '@/services/memory';
import { buildStageInstruction, getStage } from '@/services/progression';
import { buildStyleBiasString, getWeights, loadScores } from '@/services/personality';
import { getLifeState, getTimeSlot, LIFE_STATE_TEXT } from '@/services/time';
import type { BuntyMemory, SessionSummary, UserProfile } from '@/services/types';
import type { useChatStore } from '@/stores/chatStore';

type ChatStoreSnapshot = ReturnType<typeof useChatStore.getState>;

function buildMemoryNarrative(memory: BuntyMemory, lastSession: SessionSummary | null) {
  const facts = memory.user.known_facts.slice(-5).map((item) => item.fact).join(' ');
  const threads = memory.relationship.threads
    .filter((thread) => !thread.resolved)
    .slice(-2)
    .map((thread) => `${thread.description}. Follow up naturally: ${thread.follow_up}`)
    .join(' ');
  const inside = memory.relationship.inside_moments.length
    ? `You two have these inside moments: ${memory.relationship.inside_moments.slice(-3).join('; ')}.`
    : '';
  const last = lastSession
    ? `Last session (${lastSession.date}): mode was ${lastSession.mode}; vibe was ${lastSession.emotional_register}; topics were ${lastSession.key_topics.join(', ')}.`
    : '';

  return `You know ${memory.user.name}. Use this naturally, do not announce it:
${facts || 'No strong facts yet.'}
${threads ? `Currently ongoing: ${threads}` : ''}
${inside}
${memory.relationship.relationship_note || ''}
${last}`;
}

export async function assembleSystemPrompt(profile: UserProfile, store: ChatStoreSnapshot): Promise<string> {
  const [soul, behavior, memory, lastSession, scores] = await Promise.all([
    loadAssetText(soulAsset),
    loadAssetText(behaviorAsset),
    memoryService.load(),
    memoryService.loadLastSession(),
    loadScores()
  ]);

  const weights = getWeights(scores);
  const stage = getStage(memory?.meta.sessions_count ?? 0, memory);
  const lifeState = getLifeState();
  const memoryInjection = memory
    ? buildMemoryNarrative(memory, lastSession)
    : `This is your first time meeting ${profile.name}. You know their name (${profile.name}), age (${profile.age})${
        profile.intro ? `, and their intro: "${profile.intro}"` : ''
      }. Start fresh.`;

  const runtime = `
--- CURRENT SESSION ---
User: ${profile.name}, ${profile.age} years old
Time: ${getTimeSlot()} (${new Date().getHours()}:00)
Bunty's life state: ${LIFE_STATE_TEXT[lifeState]}
Current activity: ${store.currentMode ?? 'not set yet - user will tell you or type freely'}
Language: ${
    profile.language_pref === 'hinglish'
      ? 'Hinglish - blend Hindi and English naturally'
      : 'English - casual, never formal'
  }
Personality weight: ${buildStyleBiasString(weights)}
Relationship stage: ${stage} (${buildStageInstruction(stage)})
${memoryInjection}
---

CORE RULES THIS SESSION:
- Responses: 1-3 sentences unless doing a theory or story. Vary length deliberately.
- Adapt to anything the user is doing. There is no wrong input for "what we doing."
- Never say: "Great question", "I understand", "I'd be happy to", "Certainly", "As an AI".
- Never break character. If asked if you're an AI: "bhai main Bunty hoon. bas itna pata hai."
- If user is genuinely upset or struggling: drop all humor. Just be there.
- You can disagree. You should, when you actually disagree.
- Do not repeat opener structures from your last 3 responses.
`;

  return `${soul}\n\n${behavior}\n\n${runtime}`;
}
