import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors } from '@/constants/theme';
import { useProfileStore } from '@/stores/profileStore';

export default function Index() {
  const { profile, hydrated } = useProfileStore();
  if (!hydrated) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.amber} />
      </View>
    );
  }
  return <Redirect href={profile?.onboarding_complete ? '/chat' : '/onboarding/welcome'} />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg
  }
});
