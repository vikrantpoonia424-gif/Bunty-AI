import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as IntentLauncher from 'expo-intent-launcher';
import { router } from 'expo-router';
import { useState } from 'react';
import { Linking as NativeLinking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '@/constants/theme';
import { requestNotificationPermission } from '@/services/notifications';
import { useProfileStore } from '@/stores/profileStore';

export default function Permissions() {
  const [step, setStep] = useState(0);
  const setPermission = useProfileStore((s) => s.setPermission);
  const isExpoGoAndroid = Platform.OS === 'android' && Constants.executionEnvironment === 'storeClient';

  const finishStep = async (granted: boolean) => {
    if (step === 0) {
      await setPermission('permission_overlay', granted);
      setStep(1);
      return;
    }
    await setPermission('permission_notifications', granted);
    router.replace('/onboarding/language');
  };

  const grantOverlay = async () => {
    if (isExpoGoAndroid) {
      await finishStep(true);
      return;
    }

    try {
      if (Platform.OS === 'android') {
        await IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.MANAGE_OVERLAY_PERMISSION);
      } else {
        await NativeLinking.openSettings();
      }
      await finishStep(true);
    } catch {
      await NativeLinking.openSettings();
      await finishStep(true);
    }
  };

  const grantNotifications = async () => {
    const granted = await requestNotificationPermission();
    await finishStep(granted);
  };

  const isOverlay = step === 0;
  return (
    <View style={styles.screen}>
      <View style={styles.bubble}>
        <Text style={styles.text}>
          {isOverlay
            ? isExpoGoAndroid
              ? 'overlay ka real version Expo Go mein nahi dikhega. abhi main app ke andar floating orb dikha dunga; other apps ke upar bubble ke liye APK/development build chahiye.'
              : 'ek permission chahiye - overlay ke liye. iska matlab main tere screen ke upar float kar sakta hoon jab bhi call karega. deta hai?'
            : 'notifications bhi chahiye. warna main message karunga aur tu dekhega nahi. sad life hogi meri.'}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.primary} onPress={isOverlay ? grantOverlay : grantNotifications}>
          <Ionicons name={isOverlay ? 'albums-outline' : 'notifications-outline'} size={20} color={colors.bg} />
          <Text style={styles.primaryText}>
            {isOverlay ? (isExpoGoAndroid ? 'Use in-app orb for now' : 'Grant Overlay Permission') : 'Allow Notifications'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondary} onPress={() => finishStep(false)}>
          <Text style={styles.secondaryText}>Not now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: colors.bg,
    padding: 18,
    paddingTop: 84,
    paddingBottom: 36
  },
  bubble: {
    alignSelf: 'flex-start',
    maxWidth: '90%',
    borderRadius: 18,
    borderBottomLeftRadius: 6,
    backgroundColor: colors.buntyBubble,
    padding: 16
  },
  text: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 27
  },
  actions: {
    gap: 12
  },
  primary: {
    minHeight: 52,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    backgroundColor: colors.amber
  },
  primaryText: {
    color: colors.bg,
    fontSize: 16,
    fontWeight: '900'
  },
  secondary: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center'
  },
  secondaryText: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: '700'
  }
});
