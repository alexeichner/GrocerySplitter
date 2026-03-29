import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView,
  Platform, TextInput, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTripStore } from '@/store/tripStore';
import { PersonChip } from '@/components/PersonChip';
import { ItemRow } from '@/components/ItemRow';
import { AddItemModal } from '@/components/AddItemModal';
import { AddPersonModal } from '@/components/AddPersonModal';
import { Colors } from '@/constants/colors';
import { getTripTotal } from '@/utils/calculations';

export default function TripScreen() {
  const { trip, addPerson, removePerson, addItem, removeItem, updateItem, togglePersonOnItem, setTripName } = useTripStore();
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [editingTripName, setEditingTripName] = useState(false);
  const [tripNameValue, setTripNameValue] = useState(trip.name);

  const total = getTripTotal(trip);
  const isWeb = Platform.OS === 'web';

  const handleTripNameSubmit = () => {
    const trimmed = tripNameValue.trim();
    if (trimmed) {
      setTripName(trimmed);
    } else {
      setTripNameValue(trip.name);
    }
    setEditingTripName(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="cart" size={22} color={Colors.primary} style={styles.cartIcon} />
          {editingTripName ? (
            <TextInput
              style={styles.tripNameInput}
              value={tripNameValue}
              onChangeText={setTripNameValue}
              onBlur={handleTripNameSubmit}
              onSubmitEditing={handleTripNameSubmit}
              autoFocus
              returnKeyType="done"
            />
          ) : (
            <TouchableOpacity onPress={() => { setTripNameValue(trip.name); setEditingTripName(true); }}>
              <Text style={styles.tripName}>{trip.name}</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.totalBadge}>{`$${total.toFixed(2)}`}</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

        {/* People Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PEOPLE</Text>
          <View style={styles.peopleRow}>
            {trip.people.map((person) => (
              <PersonChip
                key={person.id}
                person={person}
                mode="display"
                onRemove={() => removePerson(person.id)}
              />
            ))}
            <TouchableOpacity style={styles.addPersonButton} onPress={() => setShowAddPerson(true)}>
              <Ionicons name="person-add-outline" size={16} color={Colors.primary} />
              <Text style={styles.addPersonText}>Add Person</Text>
            </TouchableOpacity>
          </View>
          {trip.people.length === 0 && (
            <Text style={styles.emptyHint}>Add people to split items between them</Text>
          )}
        </View>

        {/* Items Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ITEMS</Text>

          {trip.items.length === 0 ? (
            <View style={styles.emptyItems}>
              <Ionicons name="bag-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyItemsText}>No items yet</Text>
              <Text style={styles.emptyItemsSubtext}>Add items from your receipt</Text>
            </View>
          ) : (
            trip.items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                people={trip.people}
                onTogglePerson={(personId) => togglePersonOnItem(item.id, personId)}
                onRemove={() => removeItem(item.id)}
                onUpdateName={(name) => updateItem(item.id, { name })}
                onUpdatePrice={(price) => updateItem(item.id, { price })}
              />
            ))
          )}

          {/* Action Buttons */}
          <TouchableOpacity style={styles.actionButton} onPress={() => setShowAddItem(true)}>
            <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
            <Text style={styles.actionButtonText}>Add Item Manually</Text>
          </TouchableOpacity>

          {!isWeb && (
            <TouchableOpacity style={styles.scanButton} onPress={() => router.push('/scan')}>
              <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
              <Text style={styles.scanButtonText}>Scan Receipt</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Bottom Total */}
        {trip.items.length > 0 && (
          <View style={styles.bottomTotal}>
            <Text style={styles.bottomTotalLabel}>Trip Total</Text>
            <Text style={styles.bottomTotalAmount}>${total.toFixed(2)}</Text>
          </View>
        )}
      </ScrollView>

      <AddItemModal visible={showAddItem} onClose={() => setShowAddItem(false)} onAdd={addItem} />
      <AddPersonModal visible={showAddPerson} onClose={() => setShowAddPerson(false)} onAdd={addPerson} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cartIcon: {
    marginRight: 8,
  },
  tripName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  tripNameInput: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
    padding: 0,
    minWidth: 120,
  },
  totalBadge: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
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
  peopleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  addPersonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    gap: 6,
    marginBottom: 8,
  },
  addPersonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  emptyHint: {
    fontSize: 13,
    color: Colors.textMuted,
    fontStyle: 'italic',
    marginTop: 4,
  },
  emptyItems: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyItemsText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  emptyItemsSubtext: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    gap: 8,
    marginTop: 4,
    marginBottom: 10,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    gap: 8,
  },
  scanButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bottomTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  bottomTotalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
});
