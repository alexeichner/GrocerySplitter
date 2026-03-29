import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTripStore } from '@/store/tripStore';
import { SummaryCard } from '@/components/SummaryCard';
import { Colors } from '@/constants/colors';
import { calculateSplits, getUnsplitItems, getTripTotal } from '@/utils/calculations';

export default function SummaryScreen() {
  const { trip, clearTrip } = useTripStore();
  const splits = calculateSplits(trip);
  const unsplitItems = getUnsplitItems(trip);
  const total = getTripTotal(trip);
  const assignedTotal = splits.reduce((sum, s) => sum + s.total, 0);
  const unassignedTotal = Math.round((total - assignedTotal) * 100) / 100;

  const handleClearTrip = () => {
    Alert.alert(
      'Clear Trip',
      'This will remove all items and people. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearTrip },
      ]
    );
  };

  if (trip.items.length === 0 && trip.people.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={64} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>Nothing to summarize</Text>
          <Text style={styles.emptySubtitle}>Add items and people in the Trip tab to get started</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Trip Total Banner */}
        <View style={styles.totalBanner}>
          <Text style={styles.totalLabel}>Total Trip Cost</Text>
          <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
        </View>

        {/* Person Summaries */}
        {trip.people.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>WHO OWES WHAT</Text>
            {splits.map((summary) => (
              <SummaryCard key={summary.person.id} summary={summary} />
            ))}
          </View>
        ) : (
          <View style={styles.hint}>
            <Ionicons name="people-outline" size={24} color={Colors.textMuted} />
            <Text style={styles.hintText}>Add people in the Trip tab to see who owes what</Text>
          </View>
        )}

        {/* Unsplit Items Warning */}
        {unsplitItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️ UNASSIGNED ITEMS</Text>
            <View style={styles.unsplitCard}>
              <Text style={styles.unsplitSubtitle}>
                These items haven't been assigned to anyone yet:
              </Text>
              {unsplitItems.map((item) => (
                <View key={item.id} style={styles.unsplitRow}>
                  <Text style={styles.unsplitName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.unsplitPrice}>${item.price.toFixed(2)}</Text>
                </View>
              ))}
              <View style={styles.unsplitTotalRow}>
                <Text style={styles.unsplitTotalLabel}>Unassigned total</Text>
                <Text style={styles.unsplitTotalAmount}>${unassignedTotal.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Clear Trip Button */}
        <TouchableOpacity style={styles.clearButton} onPress={handleClearTrip}>
          <Ionicons name="trash-outline" size={18} color={Colors.danger} />
          <Text style={styles.clearButtonText}>Clear Trip</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  totalBanner: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  totalLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: Colors.textMuted,
    marginBottom: 10,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  hintText: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  unsplitCard: {
    backgroundColor: Colors.dangerLight,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  unsplitSubtitle: {
    fontSize: 13,
    color: Colors.danger,
    marginBottom: 10,
    fontWeight: '500',
  },
  unsplitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  unsplitName: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  unsplitPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.danger,
  },
  unsplitTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#FECACA',
  },
  unsplitTotalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  unsplitTotalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.danger,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.danger,
    gap: 8,
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.danger,
  },
});
