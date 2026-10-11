import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

const colors = {
  selectedBg: '#5B4FE9',
  selectedText: '#FFFFFF',
  normalBg: '#ECEAFF',
  normalText: '#3D3A5C',
  border: '#D9D6F2',
};

export default function Chip({ label, selected, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: selected }}
      style={({ pressed }) => [
        styles.base,
        selected ? styles.selected : styles.normal,
        pressed && styles.pressed,
      ]}
    >
      <Text style={selected ? styles.selectedText : styles.normalText}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  selected: {
    backgroundColor: colors.selectedBg,
    borderColor: colors.selectedBg,
  },
  normal: {
    backgroundColor: colors.normalBg,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.75,
  },
  selectedText: {
    color: colors.selectedText,
    fontSize: 14,
    fontWeight: '600',
  },
  normalText: {
    color: colors.normalText,
    fontSize: 14,
    fontWeight: '500',
  },
});
