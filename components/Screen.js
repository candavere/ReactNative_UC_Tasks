import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';

const CONTENT_MAX_WIDTH = 520;
const SHORT_HEIGHT = 520;

export default function Screen({ children, testID }) {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isShort = height < SHORT_HEIGHT;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          testID={testID}
          style={styles.flex}
          contentContainerStyle={[
            styles.content,
            isShort && styles.contentShort,
            isLandscape && styles.contentLandscape,
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={styles.inner}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  contentShort: {
    paddingVertical: spacing.md,
  },
  contentLandscape: {
    paddingHorizontal: spacing.md,
  },
  inner: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    flexGrow: 1,
    justifyContent: 'center',
  },
});
