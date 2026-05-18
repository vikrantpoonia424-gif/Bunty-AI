import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LifeState, TimeSlot, UserProfile } from '@/services/types';

const LAST_OPENER_KEY = 'last_opener';

const openers: Record<TimeSlot, string[]> = {
  morning: [
    '[name], subah ho gayi. main toh workout kar raha tha. kya plan hai aaj ka?',
    'arre tu bhi early bird hai? main toh socha akela jaag raha hoon is waqt.',
    'good morning yaar. chai pi li? bata kya scene hai.'
  ],
  midday: [
    'aa gaya. kya scene hai?',
    'bhai kahan tha itni der? chal baat karte hain.',
    'finally. main kab se bore ho raha tha. kya chal raha hai?'
  ],
  afternoon: [
    'khana kha liya? ya still procrastinating?',
    'afternoon slump mein hoon thoda. tu kya kar raha hai?',
    'bata kya scene hai. main chill mode mein hoon.'
  ],
  evening: [
    'sham ho gayi yaar. din kaisa gaya?',
    'arre aa gaya. kya chal raha hai?',
    'evening timepass mode - tu bhi?'
  ],
  night: [
    'raat ka maza alag hai. bata kya kar raha hai.',
    'sone ka plan hai ya abhi timepass mode on hai?',
    '[name] - kya chal raha hai raat ko?'
  ],
  latenight: [
    'bhai tu bhi so nahi raha? solidarity.',
    '2 baje tak - kya scene hai yaar seriously.',
    'late night club. kya chal raha hai?'
  ]
};

export function getTimeSlot(date = new Date()): TimeSlot {
  const h = date.getHours();
  if (h >= 6 && h < 10) return 'morning';
  if (h >= 10 && h < 13) return 'midday';
  if (h >= 13 && h < 17) return 'afternoon';
  if (h >= 17 && h < 21) return 'evening';
  if (h >= 21 && h < 24) return 'night';
  return 'latenight';
}

export function getLifeState(date = new Date()): LifeState {
  const h = date.getHours();
  if (h >= 6 && h < 10) return 'workout';
  if (h >= 13 && h < 15) return 'eating';
  return 'chilling';
}

export const LIFE_STATE_TEXT: Record<LifeState, string> = {
  workout: 'working out',
  eating: 'eating',
  chilling: 'chilling'
};

export async function getOpeningMessage(profile: UserProfile): Promise<string> {
  const slot = getTimeSlot();
  const last = await AsyncStorage.getItem(LAST_OPENER_KEY);
  const candidates = openers[slot].filter((line) => line !== last);
  const selected = candidates[Math.floor(Math.random() * candidates.length)] ?? openers[slot][0];
  await AsyncStorage.setItem(LAST_OPENER_KEY, selected);
  return selected.replace('[name]', profile.name || 'yaar');
}
