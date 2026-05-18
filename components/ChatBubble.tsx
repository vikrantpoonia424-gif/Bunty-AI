import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BuntyAvatar } from '@/components/BuntyAvatar';
import { colors } from '@/constants/theme';
import type { LifeState, Message } from '@/services/types';

export function ChatBubble({
  message,
  lifeState,
  onLike,
  onComment
}: {
  message: Message;
  lifeState: LifeState;
  onLike: (message: Message) => void;
  onComment: (message: Message) => void;
}) {
  const isUser = message.role === 'user';
  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowBunty]}>
      {!isUser && <BuntyAvatar lifeState={lifeState} size={34} />}
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.buntyBubble]}>
        <Text style={[styles.text, isUser && styles.userText]}>{message.content}</Text>
        {!isUser && (
          <View style={styles.actions}>
            <TouchableOpacity accessibilityLabel="Like response" onPress={() => onLike(message)} style={styles.iconButton}>
              <Ionicons
                name={message.liked ? 'heart' : 'heart-outline'}
                color={message.liked ? colors.amber : colors.text}
                size={19}
              />
            </TouchableOpacity>
            <TouchableOpacity accessibilityLabel="Reply to this response" onPress={() => onComment(message)} style={styles.iconButton}>
              <Ionicons name="chatbubble-ellipses-outline" color={colors.text} size={18} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginVertical: 6
  },
  rowBunty: {
    justifyContent: 'flex-start'
  },
  rowUser: {
    justifyContent: 'flex-end'
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8
  },
  buntyBubble: {
    backgroundColor: colors.buntyBubble,
    borderBottomLeftRadius: 6
  },
  userBubble: {
    backgroundColor: colors.userBubble,
    borderBottomRightRadius: 6
  },
  text: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 22
  },
  userText: {
    color: colors.bg,
    fontWeight: '600'
  },
  actions: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 8
  },
  iconButton: {
    minWidth: 32,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
