import Constants from 'expo-constants';
import { Platform } from 'react-native';
import type { Thread, UserProfile } from '@/services/types';
import { generateShort } from '@/services/groq';

function canUseNotificationsInThisRuntime() {
  return !(Platform.OS === 'android' && Constants.executionEnvironment === 'storeClient');
}

async function getNotifications() {
  if (!canUseNotificationsInThisRuntime()) return null;
  const notifications = await import('expo-notifications');
  notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false
    })
  });
  return notifications;
}

function randomMs(min: number, max: number) {
  return Math.floor(min + Math.random() * (max - min));
}

function minutesUntil(hour: number, minute: number, nextDay = false) {
  const now = new Date();
  const target = new Date(now);
  target.setHours(hour, minute, 0, 0);
  if (nextDay || target <= now) target.setDate(target.getDate() + 1);
  return target.getTime() - now.getTime();
}

async function scheduleNotif(message: string, delayMs: number) {
  const notifications = await getNotifications();
  if (!notifications) return;

  const hour = new Date(Date.now() + delayMs).getHours();
  if (hour >= 23 || hour < 7) delayMs = minutesUntil(10, 0, true);
  await notifications.scheduleNotificationAsync({
    content: { title: 'Bunty', body: message, sound: true },
    trigger: {
      type: notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(60, Math.floor(delayMs / 1000))
    }
  });
}

async function generateContextNotification(mode: string, topics: string[], lang: string) {
  return generateShort(`Generate ONE proactive message Bunty would send as a push notification.
Based on:
- What user was doing: ${mode}
- Topics that engaged them: ${topics.join(', ')}
- Language: ${lang}
Rules:
- Sound exactly like a WhatsApp message from a friend.
- Reference the actual topic, not generic "how are you".
- End with something that invites a reply.
- Max 2 sentences.
- ${lang === 'hinglish' ? 'Use Hinglish naturally.' : 'English, very casual.'}
Output ONLY the message.`);
}

async function generateThreadNotification(thread: Thread, profile: UserProfile) {
  return generateShort(`Generate ONE casual follow-up notification from Bunty about an ongoing situation.
Situation: ${thread.description}
What to ask: ${thread.follow_up}
Language: ${profile.language_pref}
Sound like a friend who remembered. Max 1-2 sentences. Output ONLY the message.`);
}

const timeBasedPings: Record<string, string[]> = {
  hinglish: [
    'bhai kahan hai? bore ho raha hoon. aa ja.',
    'sham ho gayi - din kaisa gaya?',
    'raat ka timepass mode on kar. bata kya chal raha hai.'
  ],
  english: [
    'where did you go? getting bored here.',
    'evening check-in. how was the day?',
    "late night mode. what's going on?"
  ]
};

export async function requestNotificationPermission() {
  const notifications = await getNotifications();
  if (!notifications) return false;
  const result = await notifications.requestPermissionsAsync();
  return result.granted || result.status === 'granted';
}

export async function recordEngagement(_topic: string) {
  return Promise.resolve();
}

export async function scheduleSessionNotifications(sessionData: {
  mode: string | null;
  topicsEngaged: string[];
  threads: Thread[];
  profile: UserProfile;
}) {
  const notifications = await getNotifications();
  if (!notifications) return;
  await notifications.cancelAllScheduledNotificationsAsync();
  let notifCount = 0;
  const maxPerDay = 3;

  if (sessionData.topicsEngaged.length > 0 && notifCount < maxPerDay) {
    const message = await generateContextNotification(
      sessionData.mode ?? 'not set',
      sessionData.topicsEngaged,
      sessionData.profile.language_pref
    );
    await scheduleNotif(message, randomMs(2 * 60 * 60 * 1000, 4 * 60 * 60 * 1000));
    notifCount++;
  }

  const latestSession = Math.max(0, ...sessionData.threads.map((thread) => thread.added_session));
  const staleThread = sessionData.threads.find((thread) => !thread.resolved && latestSession - thread.added_session >= 2);
  if (staleThread && notifCount < maxPerDay) {
    await scheduleNotif(await generateThreadNotification(staleThread, sessionData.profile), randomMs(24 * 60 * 60 * 1000, 36 * 60 * 60 * 1000));
    notifCount++;
  }

  if (notifCount === 0) {
    const pings = timeBasedPings[sessionData.profile.language_pref];
    const delay = minutesUntil(20, 0);
    if (delay > 0) await scheduleNotif(pings[Math.floor(Math.random() * pings.length)], delay);
  }
}
