import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, TouchableOpacity, View } from 'react-native';
import { colors } from '@/constants/theme';

export function BuntyOrb({ onPress, size = 80 }: { onPress?: () => void; size?: number }) {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  const animatedStyle = {
    transform: [
      {
        scale: pulseAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.15]
        })
      }
    ],
    opacity: pulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.82, 1]
    })
  };

  return (
    <Animated.View style={[styles.glow, animatedStyle, { width: size, height: size, borderRadius: size / 2 }]}>
      <TouchableOpacity accessibilityRole="button" onPress={onPress} activeOpacity={0.75} style={styles.touch}>
        <View style={[styles.core, { borderRadius: size / 2 }]} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  glow: {
    backgroundColor: 'rgba(245, 158, 11, 0.75)',
    shadowColor: colors.amber,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 18,
    elevation: 20
  },
  touch: {
    flex: 1,
    padding: 12
  },
  core: {
    flex: 1,
    backgroundColor: 'rgba(254, 243, 199, 0.18)'
  }
});
