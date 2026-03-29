import React, { useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, ActivityIndicator, Alert, Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTripStore } from '@/store/tripStore';
import { parseReceiptText, extractTextFromImage } from '@/utils/receiptParser';
import { Colors } from '@/constants/colors';
import { GOOGLE_VISION_API_KEY } from '@/constants/config';
import { ParsedReceiptItem } from '@/store/types';

type Step = 'capture' | 'processing' | 'review';

export default function ScanScreen() {
  const { addItemsBulk } = useTripStore();
  const [step, setStep] = useState<Step>('capture');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [parsedItems, setParsedItems] = useState<ParsedReceiptItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const hasApiKey = GOOGLE_VISION_API_KEY.trim().length > 0;

  const pickImage = async (useCamera: boolean) => {
    setError(null);
    let result;

    if (useCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera access is required to scan receipts.');
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.9,
        base64: true,
      });
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Photo library access is required to select receipts.');
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.9,
        base64: true,
      });
    }

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setImageUri(asset.uri);
    setStep('processing');
    await processImage(asset.base64 || '');
  };

  const processImage = async (base64: string) => {
    if (!hasApiKey) {
      setError('No API key configured. See constants/config.ts to add your Google Cloud Vision API key.');
      setStep('capture');
      return;
    }

    try {
      const text = await extractTextFromImage(base64, GOOGLE_VISION_API_KEY);
      const items = parseReceiptText(text);

      if (items.length === 0) {
        setError('Could not find any items on this receipt. Try a clearer photo.');
        setStep('capture');
        return;
      }

      setParsedItems(items);
      setSelectedItems(new Set(items.map((_, i) => i))); // Select all by default
      setStep('review');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to process receipt. Please try again.';
      setError(message);
      setStep('capture');
    }
  };

  const toggleItem = (index: number) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleAddToTrip = () => {
    const itemsToAdd = parsedItems.filter((_, i) => selectedItems.has(i));
    if (itemsToAdd.length === 0) {
      Alert.alert('No items selected', 'Please select at least one item to add.');
      return;
    }
    addItemsBulk(itemsToAdd);
    router.back();
  };

  const handleRetry = () => {
    setStep('capture');
    setImageUri(null);
    setParsedItems([]);
    setSelectedItems(new Set());
    setError(null);
  };

  if (step === 'processing') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.processingText}>Scanning receipt...</Text>
          <Text style={styles.processingSubtext}>This may take a few seconds</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (step === 'review') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.reviewContent}>
          {imageUri && (
            <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="contain" />
          )}

          <Text style={styles.reviewTitle}>
            Found {parsedItems.length} item{parsedItems.length !== 1 ? 's' : ''}
          </Text>
          <Text style={styles.reviewSubtitle}>Select the items you want to add to your trip:</Text>

          {parsedItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.reviewItem, selectedItems.has(index) && styles.reviewItemSelected]}
              onPress={() => toggleItem(index)}
              activeOpacity={0.7}
            >
              <View style={styles.reviewItemLeft}>
                <Ionicons
                  name={selectedItems.has(index) ? 'checkmark-circle' : 'ellipse-outline'}
                  size={22}
                  color={selectedItems.has(index) ? Colors.primary : Colors.textMuted}
                />
                <Text style={styles.reviewItemName} numberOfLines={2}>{item.name}</Text>
              </View>
              <Text style={styles.reviewItemPrice}>${item.price.toFixed(2)}</Text>
            </TouchableOpacity>
          ))}

          <View style={styles.reviewActions}>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Ionicons name="camera-outline" size={18} color={Colors.textSecondary} />
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addButton} onPress={handleAddToTrip}>
              <Text style={styles.addButtonText}>
                Add {selectedItems.size} Item{selectedItems.size !== 1 ? 's' : ''} to Trip
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // step === 'capture'
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.captureContainer}>
        <Ionicons name="camera-outline" size={80} color={Colors.primary} />
        <Text style={styles.captureTitle}>Scan Your Receipt</Text>
        <Text style={styles.captureSubtitle}>
          Take a photo of your receipt or choose one from your library to automatically add items to your trip.
        </Text>

        {!hasApiKey && (
          <View style={styles.apiKeyWarning}>
            <Ionicons name="warning-outline" size={20} color={Colors.warning} />
            <Text style={styles.apiKeyWarningText}>
              Receipt scanning requires a Google Cloud Vision API key. Add it in{' '}
              <Text style={styles.codeText}>constants/config.ts</Text>
            </Text>
          </View>
        )}

        {error && (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={18} color={Colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.captureButton, !hasApiKey && styles.captureButtonDisabled]}
          onPress={() => pickImage(true)}
          disabled={!hasApiKey}
        >
          <Ionicons name="camera" size={22} color="#FFFFFF" />
          <Text style={styles.captureButtonText}>Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.libraryButton, !hasApiKey && styles.libraryButtonDisabled]}
          onPress={() => pickImage(false)}
          disabled={!hasApiKey}
        >
          <Ionicons name="images-outline" size={22} color={hasApiKey ? Colors.primary : Colors.textMuted} />
          <Text style={[styles.libraryButtonText, !hasApiKey && { color: Colors.textMuted }]}>
            Choose from Library
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  processingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  processingText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  processingSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  captureContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  captureTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  captureSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
  apiKeyWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    padding: 12,
    gap: 10,
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  apiKeyWarningText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.dangerLight,
    borderRadius: 10,
    padding: 12,
    gap: 8,
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: Colors.danger,
    lineHeight: 18,
  },
  captureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 14,
    gap: 10,
    width: '100%',
    maxWidth: 360,
  },
  captureButtonDisabled: {
    backgroundColor: Colors.border,
  },
  captureButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  libraryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    padding: 16,
    borderRadius: 14,
    gap: 10,
    width: '100%',
    maxWidth: 360,
  },
  libraryButtonDisabled: {
    borderColor: Colors.border,
  },
  libraryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  reviewContent: {
    padding: 16,
    paddingBottom: 40,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: Colors.border,
  },
  reviewTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  reviewSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  reviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reviewItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  reviewItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  reviewItemName: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  reviewItemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
    marginLeft: 8,
  },
  reviewActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  retryButton: {
    flex: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
    paddingHorizontal: 16,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  addButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
