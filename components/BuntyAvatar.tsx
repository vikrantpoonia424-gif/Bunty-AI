import { Image, StyleSheet, View } from 'react-native';
import { colors } from '@/constants/theme';
import { LIFE_STATE_TEXT } from '@/services/time';
import type { LifeState } from '@/services/types';

const avatarSource: Record<LifeState, number> = {
  workout: require('@/assets/avatars/avatar_workout1.png'),
  eating: require('@/assets/avatars/avatar_eating1.png'),
  chilling: require('@/assets/avatars/avatar_chill1.png')
};

export function BuntyAvatar({ lifeState, size = 42 }: { lifeState: LifeState; size?: number }) {
  return (
    <View
      accessibilityLabel={`Bunty avatar, ${LIFE_STATE_TEXT[lifeState]}`}
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2
        }
      ]}
    >
      <Image source={avatarSource[lifeState]} style={styles.image} resizeMode="cover" />
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: colors.surface,
    shadowColor: colors.amber,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8
  },
  image: {
    width: '100%',
    height: '100%'
  }
});
