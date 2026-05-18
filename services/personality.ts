import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StyleKey } from '@/services/types';

const PERSONALITY_KEY = 'personality_scores';

interface PersonalityScores extends Record<StyleKey, number> {
  total_likes: number;
}

const defaults: PersonalityScores = {
  savage: 0,
  chill: 0,
  hype: 0,
  conspiracy: 0,
  total_likes: 0
};

export function detectStyle(response: string): StyleKey {
  const lower = response.toLowerCase();
  if (/[A-Z]{3,}/.test(response) || (response.match(/!/g) || []).length >= 2) return 'hype';
  if (['sab mila hua', 'theory', 'soch iske', 'scripted', 'plan hai'].some((m) => lower.includes(m))) {
    return 'conspiracy';
  }
  if (['seriously kar raha', 'main judge', 'masochist', 'bhai ye kya', 'bhai seriously'].some((m) => lower.includes(m))) {
    return 'savage';
  }
  return 'chill';
}

export async function loadScores(): Promise<PersonalityScores> {
  const raw = await AsyncStorage.getItem(PERSONALITY_KEY);
  return raw ? { ...defaults, ...JSON.parse(raw) } : { ...defaults };
}

export async function recordLike(style: StyleKey = 'chill') {
  const scores = await loadScores();
  scores[style] += 1;
  scores.total_likes += 1;
  await AsyncStorage.setItem(PERSONALITY_KEY, JSON.stringify(scores));
}

export function getWeights(scores: PersonalityScores): Record<StyleKey, number> {
  if (scores.total_likes < 6) return { savage: 25, chill: 25, hype: 25, conspiracy: 25 };
  const styles: StyleKey[] = ['savage', 'chill', 'hype', 'conspiracy'];
  const dominant = styles.reduce((a, b) => (scores[a] > scores[b] ? a : b));
  const dominantShare = scores[dominant] / scores.total_likes;
  if (dominantShare < 0.4) return { savage: 25, chill: 25, hype: 25, conspiracy: 25 };
  const weights = { savage: 20, chill: 20, hype: 20, conspiracy: 20 };
  weights[dominant] = 40;
  return weights;
}

export function buildStyleBiasString(weights: Record<StyleKey, number>) {
  const dominant = (Object.entries(weights) as [StyleKey, number][]).sort((a, b) => b[1] - a[1])[0];
  if (dominant[1] === 25) {
    return 'No strong preference established yet. Stay balanced and rotate naturally across all four styles.';
  }
  const descriptions: Record<StyleKey, string> = {
    savage: 'This user tends to respond best to savage/roast mode. Use it around 40% of the time, affectionate not mean.',
    chill: 'This user tends to respond best to dry, deadpan chill mode. Understatement and precision land well.',
    hype: 'This user tends to respond best to high-energy enthusiasm. Let caps and exclamation out when it fits.',
    conspiracy: 'This user tends to respond best to theory/conspiracy mode. Commit to the bit when the topic fits.'
  };
  return descriptions[dominant[0]];
}
