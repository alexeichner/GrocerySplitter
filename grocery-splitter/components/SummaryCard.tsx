import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PersonSummary } from '@/store/types';
import { Colors } from '@/constants/colors';

interface SummaryCardProps {
  summary: PersonSummary;
}

export function SummaryCard({ summary }: SummaryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { person, total, itemBreakdown } = summary;

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.personInfo}>
          <View style={[styles.colorDot, { backgroundColor: person.color }]} />
          <Text style={styles.personName}>{person.name}</Text>
        </View>
        <View style={styles.rightSection}>
          <Text style={styles.total}>${total.toFixed(2)}</Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={Colors.textSecondary}
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.breakdown}>
          {itemBreakdown.length === 0 ? (
            <Text style={styles.emptyText}>No items assigned</Text>
          ) : (
            itemBreakdown.map(({ item, share }) => (
              <View key={item.id} style={styles.breakdownRow}>
                <Text style={styles.breakdownName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.breakdownShare}>${share.toFixed(2)}</Text>
                {item.splitBetween.length > 1 && (
                  <Text style={styles.splitNote}>÷{item.splitBetween.length}</Text>
                )}
              </View>
            ))
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  personInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 10,
  },
  personName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  total: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.primary,
  },
  breakdown: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  breakdownName: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  breakdownShare: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  splitNote: {
    fontSize: 12,
    color: Colors.textMuted,
    marginLeft: 6,
    fontStyle: 'italic',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
});
