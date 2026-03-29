import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard,
} from 'react-native';
import { Colors } from '@/constants/colors';

interface AddPersonModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (name: string) => void;
}

export function AddPersonModal({ visible, onClose, onAdd }: AddPersonModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter a name.');
      return;
    }
    onAdd(trimmed);
    setName('');
    setError('');
    onClose();
  };

  const handleClose = () => {
    setName('');
    setError('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <View style={styles.card}>
                <Text style={styles.title}>Add Person</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Name (e.g. Alice)"
                  placeholderTextColor={Colors.textMuted}
                  value={name}
                  onChangeText={setName}
                  returnKeyType="done"
                  onSubmitEditing={handleAdd}
                  autoFocus
                />
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <View style={styles.buttons}>
                  <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
                    <Text style={styles.addText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: Colors.text,
    marginBottom: 12,
    backgroundColor: Colors.background,
  },
  error: {
    color: Colors.danger,
    fontSize: 13,
    marginBottom: 12,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelText: {
    color: Colors.textSecondary,
    fontWeight: '600',
    fontSize: 15,
  },
  addButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  addText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
