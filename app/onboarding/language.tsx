import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '@/constants/theme';
import type { LanguagePref } from '@/services/types';
import { useProfileStore } from '@/stores/profileStore';

export default function Language() {
  const complete = useProfileStore((s) => s.completeOnboarding);

  const choose = async (language: LanguagePref) => {
    await complete(language);
    router.replace('/chat');
  };

  return (
    <View style={styles.screen}>
      <View style={styles.bubble}>
        <Text style={styles.text}>ek important sawaal - kaise baat karun tujhse?</Text>
      </View>
      <View style={styles.cards}>
        <TouchableOpacity style={styles.card} onPress={() => choose('hinglish')}>
          <Text style={styles.title}>Hinglish</Text>
          <Text style={styles.sub}>Hindi + English milaake - meri natural style</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => choose('english')}>
          <Text style={styles.title}>English only</Text>
          <Text style={styles.sub}>Clean, simple English</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 18,
    paddingTop: 84
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
  cards: {
    marginTop: 44,
    gap: 14
  },
  card: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: 18
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 6
  },
  sub: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 21
  }
});
