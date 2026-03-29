import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GroceryItem, Person } from '@/store/types';
import { PersonChip } from './PersonChip';
import { Colors } from '@/constants/colors';

interface ItemRowProps {
  item: GroceryItem;
  people: Person[];
  onTogglePerson: (personId: string) => void;
  onRemove: () => void;
  onUpdateName: (name: string) => void;
  onUpdatePrice: (price: number) => void;
}

export function ItemRow({ item, people, onTogglePerson, onRemove, onUpdateName, onUpdatePrice }: ItemRowProps) {
  const [editingName, setEditingName] = useState(false);
  const [editingPrice, setEditingPrice] = useState(false);
  const [nameValue, setNameValue] = useState(item.name);
  const [priceValue, setPriceValue] = useState(item.price.toFixed(2));

  const handleNameSubmit = () => {
    const trimmed = nameValue.trim();
    if (trimmed.length > 0) {
      onUpdateName(trimmed);
    } else {
      setNameValue(item.name);
    }
    setEditingName(false);
  };

  const handlePriceSubmit = () => {
    const parsed = parseFloat(priceValue);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdatePrice(parsed);
      setPriceValue(parsed.toFixed(2));
    } else {
      setPriceValue(item.price.toFixed(2));
    }
    setEditingPrice(false);
  };

  const confirmDelete = () => {
    Alert.alert('Remove Item', `Remove "${item.name}" from the trip?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: onRemove },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {/* Name */}
        {editingName ? (
          <TextInput
            style={styles.nameInput}
            value={nameValue}
            onChangeText={setNameValue}
            onBlur={handleNameSubmit}
            onSubmitEditing={handleNameSubmit}
            autoFocus
            returnKeyType="done"
          />
        ) : (
          <TouchableOpacity onPress={() => setEditingName(true)} style={styles.nameContainer}>
            <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
          </TouchableOpacity>
        )}

        <View style={styles.rightSection}>
          {/* Price */}
          {editingPrice ? (
            <TextInput
              style={styles.priceInput}
              value={priceValue}
              onChangeText={setPriceValue}
              onBlur={handlePriceSubmit}
              onSubmitEditing={handlePriceSubmit}
              keyboardType="decimal-pad"
              autoFocus
              returnKeyType="done"
            />
          ) : (
            <TouchableOpacity onPress={() => setEditingPrice(true)}>
              <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
            </TouchableOpacity>
          )}

          {/* Delete */}
          <TouchableOpacity onPress={confirmDelete} style={styles.deleteButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="trash-outline" size={18} color={Colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Person toggles */}
      {people.length > 0 && (
        <View style={styles.peopleRow}>
          {people.map((person) => (
            <PersonChip
              key={person.id}
              person={person}
              mode="toggle"
              selected={item.splitBetween.includes(person.id)}
              onPress={() => onTogglePerson(person.id)}
            />
          ))}
        </View>
      )}

      {people.length === 0 && (
        <Text style={styles.noPeopleHint}>Add people to the trip to split this item</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  nameContainer: {
    flex: 1,
    marginRight: 8,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  nameInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
    marginRight: 8,
    padding: 0,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  priceInput: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
    minWidth: 60,
    textAlign: 'right',
    padding: 0,
  },
  deleteButton: {
    padding: 2,
  },
  peopleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  noPeopleHint: {
    fontSize: 12,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
});
