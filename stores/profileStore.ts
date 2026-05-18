import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import type { LanguagePref, UserProfile } from '@/services/types';

const PROFILE_KEY = 'bunty_profile';

interface ProfileState {
  profile: UserProfile | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setName: (name: string) => Promise<void>;
  setAge: (age: number) => Promise<void>;
  setIntro: (intro: string | null) => Promise<void>;
  setPermission: (key: 'permission_overlay' | 'permission_notifications', value: boolean) => Promise<void>;
  completeOnboarding: (language: LanguagePref) => Promise<void>;
}

const emptyProfile: UserProfile = {
  name: '',
  age: 0,
  intro: null,
  language_pref: 'hinglish',
  permission_overlay: false,
  permission_notifications: false,
  onboarding_complete: false
};

async function persist(profile: UserProfile) {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  hydrated: false,
  hydrate: async () => {
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    set({ profile: raw ? JSON.parse(raw) : { ...emptyProfile }, hydrated: true });
  },
  setName: async (name) => {
    const profile = { ...(get().profile ?? emptyProfile), name: name.trim() };
    set({ profile });
    await persist(profile);
  },
  setAge: async (age) => {
    const profile = { ...(get().profile ?? emptyProfile), age };
    set({ profile });
    await persist(profile);
  },
  setIntro: async (intro) => {
    const profile = { ...(get().profile ?? emptyProfile), intro: intro?.trim() || null };
    set({ profile });
    await persist(profile);
  },
  setPermission: async (key, value) => {
    const profile = { ...(get().profile ?? emptyProfile), [key]: value };
    set({ profile });
    await persist(profile);
  },
  completeOnboarding: async (language) => {
    const profile = {
      ...(get().profile ?? emptyProfile),
      language_pref: language,
      onboarding_complete: true
    };
    set({ profile });
    await persist(profile);
    await AsyncStorage.setItem('onboarding_complete', 'true');
  }
}));
