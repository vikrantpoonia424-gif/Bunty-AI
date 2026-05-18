import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '@/constants/theme';
import { useProfileStore } from '@/stores/profileStore';

export default function ProfileOnboarding() {
  const [step, setStep] = useState(0);
  const [value, setValue] = useState('');
  const profile = useProfileStore((s) => s.profile);
  const store = useProfileStore();

  const buntyLine = useMemo(() => {
    if (step === 0) return "tera naam kya hai? main 'yaar' bol sakta hoon lekin naam pata ho toh acha lagta hai.";
    if (step === 1) return `acha ${profile?.name || 'yaar'}. umar bata - roughly. promise hai main tujhe age-appropriate treat karunga.`;
    return 'last cheez - 1-2 lines apne baare mein. job, college, kya chal raha hai. ya skip kar, no pressure.';
  }, [profile?.name, step]);

  const submit = async (skip = false) => {
    if (!skip && !value.trim()) return;
    if (step === 0) await store.setName(value);
    if (step === 1) await store.setAge(Number(value.replace(/\D/g, '')) || 18);
    if (step === 2) {
      await store.setIntro(skip ? null : value);
      router.replace('/onboarding/permissions');
      return;
    }
    setValue('');
    setStep((s) => s + 1);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.screen}>
      <View style={styles.dots}>
        {[0, 1, 2].map((dot) => (
          <View key={dot} style={[styles.dot, dot === step && styles.dotActive]} />
        ))}
      </View>
      <View style={styles.bubble}>
        <Text style={styles.bunty}>{buntyLine}</Text>
      </View>
      <View style={styles.inputBar}>
        <TextInput
          value={value}
          onChangeText={setValue}
          keyboardType={step === 1 ? 'number-pad' : 'default'}
          placeholder={step === 1 ? 'age' : step === 2 ? 'type or skip' : 'naam'}
          placeholderTextColor={colors.muted}
          style={styles.input}
          returnKeyType="send"
          onSubmitEditing={() => submit(false)}
        />
        {step === 2 && (
          <TouchableOpacity style={styles.skip} onPress={() => submit(true)}>
            <Text style={styles.skipText}>SKIP</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity accessibilityLabel="Continue" onPress={() => submit(false)} style={styles.send}>
          <Ionicons name="arrow-forward" size={20} color={colors.bg} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: colors.bg,
    padding: 18,
    paddingTop: 56
  },
  dots: {
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 8
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.line
  },
  dotActive: {
    width: 22,
    backgroundColor: colors.amber
  },
  bubble: {
    alignSelf: 'flex-start',
    maxWidth: '88%',
    borderRadius: 18,
    borderBottomLeftRadius: 6,
    backgroundColor: colors.buntyBubble,
    padding: 16
  },
  bunty: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 26
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 12
  },
  input: {
    flex: 1,
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    color: colors.text,
    paddingHorizontal: 14,
    fontSize: 16
  },
  skip: {
    paddingHorizontal: 10,
    height: 48,
    justifyContent: 'center'
  },
  skipText: {
    color: colors.muted,
    fontWeight: '800'
  },
  send: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.amber
  }
});
