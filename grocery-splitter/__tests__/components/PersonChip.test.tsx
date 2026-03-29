import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PersonChip } from '@/components/PersonChip';
import { Person } from '@/store/types';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

const mockPerson: Person = {
  id: 'person-1',
  name: 'Alice',
  color: '#EF4444',
};

describe('PersonChip', () => {
  describe('display mode', () => {
    it('renders the person name', () => {
      const { getByText } = render(
        <PersonChip person={mockPerson} mode="display" />
      );
      expect(getByText('Alice')).toBeTruthy();
    });

    it('shows the remove button when onRemove is provided', () => {
      const onRemove = jest.fn();
      const { getByText } = render(
        <PersonChip person={mockPerson} mode="display" onRemove={onRemove} />
      );
      expect(getByText('×')).toBeTruthy();
    });

    it('does NOT show remove button when onRemove is not provided', () => {
      const { queryByText } = render(
        <PersonChip person={mockPerson} mode="display" />
      );
      expect(queryByText('×')).toBeNull();
    });

    it('calls onRemove when × is tapped', () => {
      const onRemove = jest.fn();
      const { getByText } = render(
        <PersonChip person={mockPerson} mode="display" onRemove={onRemove} />
      );
      fireEvent.press(getByText('×'));
      expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it('calls onPress when chip is tapped', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <PersonChip person={mockPerson} mode="display" onPress={onPress} />
      );
      fireEvent.press(getByText('Alice'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('toggle mode', () => {
    it('renders the person name', () => {
      const { getByText } = render(
        <PersonChip person={mockPerson} mode="toggle" selected={false} />
      );
      expect(getByText('Alice')).toBeTruthy();
    });

    it('uses person color as background when selected=true', () => {
      const { getByTestId } = render(
        <PersonChip person={mockPerson} mode="toggle" selected={true} />
      );
      const chip = getByTestId('person-chip');
      expect(chip.props.style).toEqual(
        expect.objectContaining({ backgroundColor: mockPerson.color })
      );
    });

    it('uses gray background when selected=false', () => {
      const { getByTestId } = render(
        <PersonChip person={mockPerson} mode="toggle" selected={false} />
      );
      const chip = getByTestId('person-chip');
      expect(chip.props.style).toEqual(
        expect.objectContaining({ backgroundColor: '#E5E7EB' })
      );
    });

    it('calls onPress when chip is tapped', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <PersonChip person={mockPerson} mode="toggle" selected={false} onPress={onPress} />
      );
      fireEvent.press(getByText('Alice'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });
});
