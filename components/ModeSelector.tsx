import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '@/constants/theme';

const defaults = [
  'Watching Cricket',
  'Scrolling Reels',
  'Watching a Show',
  'Startup Twitter',
  'Just Chilling',
  'Kuch aur...'
];

export function ModeSelector({
  modeFrequency,
  onSelect
}: {
  modeFrequency: Record<string, number>;
  onSelect: (mode: string) => void;
}) {
  const [customOpen, setCustomOpen] = useState(false);
  const [custom, setCustom] = useState('');
  const sortedModes = useMemo(
    () => [...defaults].sort((a, b) => (modeFrequency[b] ?? 0) - (modeFrequency[a] ?? 0)),
    [modeFrequency]
  );

  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {sortedModes.map((mode) => (
          <TouchableOpacity
            key={mode}
            style={styles.pill}
            onPress={() => (mode === 'Kuch aur...' ? setCustomOpen(true) : onSelect(mode))}
            activeOpacity={0.8}
          >
            <Text style={styles.pillText}>{mode}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {customOpen && (
        <View style={styles.customRow}>
          <TextInput
            value={custom}
            onChangeText={setCustom}
            placeholder="kya scene hai?"
            placeholderTextColor={colors.muted}
            style={styles.input}
            returnKeyType="done"
            onSubmitEditing={() => {
              if (custom.trim()) onSelect(custom.trim());
              setCustom('');
              setCustomOpen(false);
            }}
          />
          <TouchableOpacity
            accessibilityLabel="Set custom mode"
            style={styles.send}
            onPress={() => {
              if (custom.trim()) onSelect(custom.trim());
              setCustom('');
              setCustomOpen(false);
            }}
          >
            <Ionicons name="checkmark" size={20} color={colors.bg} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingVertical: 8
  },
  scroll: {
    gap: 8,
    paddingHorizontal: 14
  },
  pill: {
    minHeight: 38,
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: colors.amberSoft,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14
  },
  pillText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600'
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 8
  },
  input: {
    flex: 1,
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    color: colors.text,
    paddingHorizontal: 12,
    backgroundColor: colors.surface
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.amber
  }
});
