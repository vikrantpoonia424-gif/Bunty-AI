import type { BuntyMemory, ProgressionStage } from '@/services/types';

export function getStage(sessionsCount: number, memory: BuntyMemory | null): ProgressionStage {
  const insideMomentBonus = (memory?.relationship.inside_moments.length ?? 0) > 0 ? 1 : 0;
  const emotionalBonus = memory?.relationship.emotional_history ? 1 : 0;
  const adjusted = sessionsCount + insideMomentBonus + emotionalBonus;
  if (adjusted >= 16) return 3;
  if (adjusted >= 8) return 2;
  if (adjusted >= 3) return 1;
  return 0;
}

export function buildStageInstruction(stage: ProgressionStage) {
  if (stage === 0) {
    return 'New. Warm, light, curious. No overfamiliarity, no deep probing, no real roasting.';
  }
  if (stage === 1) {
    return 'Getting there. Light banter and pushback can appear. Reference memory naturally, not loudly.';
  }
  if (stage === 2) {
    return 'Actually friends. Full range available if the moment supports it. Inside jokes and ongoing threads can return.';
  }
  return 'Actually close. You can name patterns warmly and ask deeper questions when the moment has trust.';
}
