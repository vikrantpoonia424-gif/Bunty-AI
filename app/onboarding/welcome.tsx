import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BuntyOrb } from '@/components/BuntyOrb';
import { colors } from '@/constants/theme';

const lines = ['ek second... boot ho raha hoon', 'haan, ab theek hoon. chalo milte hain.'];

export default function Welcome() {
  const [lineIndex, setLineIndex] = useState(0);
  const [visible, setVisible] = useState('');

  useEffect(() => {
    let char = 0;
    const timer = setInterval(() => {
      char += 1;
      setVisible(lines[lineIndex].slice(0, char));
      if (char >= lines[lineIndex].length) clearInterval(timer);
    }, 45);
    return () => clearInterval(timer);
  }, [lineIndex]);

  useEffect(() => {
    if (lineIndex === 0 && visible === lines[0]) {
      const timer = setTimeout(() => {
        setVisible('');
        setLineIndex(1);
      }, 1500);
      return () => clearTimeout(timer);
    }
    if (lineIndex === 1 && visible === lines[1]) {
      const timer = setTimeout(() => router.replace('/onboarding/profile'), 2000);
      return () => clearTimeout(timer);
    }
  }, [lineIndex, visible]);

  return (
    <View style={styles.screen}>
      <BuntyOrb />
      <Text style={styles.text}>{visible}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
    paddingHorizontal: 28
  },
  text: {
    marginTop: 28,
    minHeight: 54,
    color: colors.text,
    fontSize: 19,
    lineHeight: 27,
    textAlign: 'center'
  }
});
