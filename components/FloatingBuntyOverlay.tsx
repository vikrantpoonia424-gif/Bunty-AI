import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { BuntyOrb } from '@/components/BuntyOrb';

export function FloatingBuntyOverlay({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;

  return (
    <View pointerEvents="box-none" style={styles.host}>
      <BuntyOrb size={54} onPress={() => router.push('/chat')} />
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    right: 18,
    bottom: 30,
    zIndex: 50,
    elevation: 50
  }
});
