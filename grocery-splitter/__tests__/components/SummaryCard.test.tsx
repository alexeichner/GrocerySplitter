import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SummaryCard } from '@/components/SummaryCard';
import { PersonSummary, Person, GroceryItem } from '@/store/types';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

const mockPerson: Person = {
  id: 'person-1',
  name: 'Alice',
  color: '#3B82F6',
};

const mockItem1: GroceryItem = {
  id: 'item-1',
  name: 'Milk',
  price: 4.99,
  splitBetween: ['person-1', 'person-2'],
};

const mockItem2: GroceryItem = {
  id: 'item-2',
  name: 'Bread',
  price: 3.50,
  splitBetween: ['person-1'],
};

const mockSummaryWithItems: PersonSummary = {
  person: mockPerson,
  total: 15.00,
  itemBreakdown: [
    { item: mockItem1, share: 2.50 },
    { item: mockItem2, share: 3.50 },
  ],
};

const mockSummaryNoItems: PersonSummary = {
  person: mockPerson,
  total: 0,
  itemBreakdown: [],
};

describe('SummaryCard', () => {
  it('renders the person name', () => {
    const { getByText } = render(<SummaryCard summary={mockSummaryWithItems} />);
    expect(getByText('Alice')).toBeTruthy();
  });

  it('renders the formatted total', () => {
    const { getByText } = render(<SummaryCard summary={mockSummaryWithItems} />);
    expect(getByText('$15.00')).toBeTruthy();
  });

  it('breakdown is initially hidden (collapsed)', () => {
    const { queryByText } = render(<SummaryCard summary={mockSummaryWithItems} />);
    // Item names should not be visible before expanding
    expect(queryByText('Milk')).toBeNull();
    expect(queryByText('Bread')).toBeNull();
  });

  it('tapping the card expands the breakdown', () => {
    const { getByText } = render(<SummaryCard summary={mockSummaryWithItems} />);
    // Tap the header (person name is in the header)
    fireEvent.press(getByText('Alice'));
    // Now items should be visible
    expect(getByText('Milk')).toBeTruthy();
    expect(getByText('Bread')).toBeTruthy();
  });

  it('breakdown shows each item name and share amount', () => {
    const { getByText } = render(<SummaryCard summary={mockSummaryWithItems} />);
    fireEvent.press(getByText('Alice'));
    expect(getByText('Milk')).toBeTruthy();
    expect(getByText('$2.50')).toBeTruthy();
    expect(getByText('Bread')).toBeTruthy();
    expect(getByText('$3.50')).toBeTruthy();
  });

  it('shows "No items assigned" when itemBreakdown is empty', () => {
    const { getByText } = render(<SummaryCard summary={mockSummaryNoItems} />);
    // Expand the card
    fireEvent.press(getByText('Alice'));
    expect(getByText('No items assigned')).toBeTruthy();
  });

  it('tapping again collapses the breakdown', () => {
    const { getByText, queryByText } = render(<SummaryCard summary={mockSummaryWithItems} />);
    // Expand
    fireEvent.press(getByText('Alice'));
    expect(getByText('Milk')).toBeTruthy();
    // Collapse
    fireEvent.press(getByText('Alice'));
    expect(queryByText('Milk')).toBeNull();
  });
});
