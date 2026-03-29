import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Person } from '@/store/types';

interface PersonChipProps {
  person: Person;
  mode: 'display' | 'toggle';
  selected?: boolean; // only used in toggle mode
  onPress?: () => void;
  onRemove?: () => void; // only used in display mode
}

export function PersonChip({ person, mode, selected = false, onPress, onRemove }: PersonChipProps) {
  // In toggle mode: full color bg when selected, light gray bg when not
  // In display mode: always shows the person's color
  const backgroundColor = mode === 'toggle'
    ? (selected ? person.color : '#E5E7EB')
    : person.color;
  const textColor = mode === 'toggle'
    ? (selected ? '#FFFFFF' : '#6B7280')
    : '#FFFFFF';

  return (
    <TouchableOpacity
      testID="person-chip"
      style={[styles.chip, { backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, { color: textColor }]} numberOfLines={1}>
        {person.name}
      </Text>
      {mode === 'display' && onRemove && (
        <TouchableOpacity onPress={onRemove} style={styles.removeButton} hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}>
          <Text style={styles.removeText}>×</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    maxWidth: 80,
  },
  removeButton: {
    marginLeft: 4,
  },
  removeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
  },
});
