import { create } from 'zustand';
import { GroceryItem, GroceryTrip, ItemId, Person, PersonId, ParsedReceiptItem } from './types';

// Color palette for auto-assigning to new people
const PERSON_COLORS = [
  '#EF4444', '#3B82F6', '#22C55E', '#F59E0B',
  '#8B5CF6', '#EC4899', '#06B6D4', '#F97316',
];

// Helper to generate simple unique IDs
function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

interface TripStore {
  trip: GroceryTrip;

  // Person actions
  addPerson: (name: string) => void;
  removePerson: (id: PersonId) => void;

  // Item actions
  addItem: (name: string, price: number) => void;
  removeItem: (id: ItemId) => void;
  updateItem: (id: ItemId, updates: Partial<Pick<GroceryItem, 'name' | 'price'>>) => void;
  togglePersonOnItem: (itemId: ItemId, personId: PersonId) => void;
  addItemsBulk: (items: Array<{ name: string; price: number }>) => void;

  // Trip actions
  setTripName: (name: string) => void;
  clearTrip: () => void;
}

const defaultTrip: GroceryTrip = {
  name: 'Costco Run',
  date: new Date().toISOString(),
  people: [],
  items: [],
};

export const useTripStore = create<TripStore>((set) => ({
  trip: defaultTrip,

  addPerson: (name) => set((state) => {
    const colorIndex = state.trip.people.length % PERSON_COLORS.length;
    const newPerson: Person = {
      id: generateId(),
      name: name.trim(),
      color: PERSON_COLORS[colorIndex],
    };
    return { trip: { ...state.trip, people: [...state.trip.people, newPerson] } };
  }),

  removePerson: (id) => set((state) => ({
    trip: {
      ...state.trip,
      people: state.trip.people.filter((p) => p.id !== id),
      items: state.trip.items.map((item) => ({
        ...item,
        splitBetween: item.splitBetween.filter((pid) => pid !== id),
      })),
    },
  })),

  addItem: (name, price) => set((state) => {
    const newItem: GroceryItem = {
      id: generateId(),
      name: name.trim(),
      price: Math.round(price * 100) / 100,
      splitBetween: [],
    };
    return { trip: { ...state.trip, items: [...state.trip.items, newItem] } };
  }),

  removeItem: (id) => set((state) => ({
    trip: { ...state.trip, items: state.trip.items.filter((item) => item.id !== id) },
  })),

  updateItem: (id, updates) => set((state) => ({
    trip: {
      ...state.trip,
      items: state.trip.items.map((item) =>
        item.id === id
          ? { ...item, ...updates, price: updates.price !== undefined ? Math.round(updates.price * 100) / 100 : item.price }
          : item
      ),
    },
  })),

  togglePersonOnItem: (itemId, personId) => set((state) => ({
    trip: {
      ...state.trip,
      items: state.trip.items.map((item) => {
        if (item.id !== itemId) return item;
        const isAlreadySplitting = item.splitBetween.includes(personId);
        return {
          ...item,
          splitBetween: isAlreadySplitting
            ? item.splitBetween.filter((id) => id !== personId)
            : [...item.splitBetween, personId],
        };
      }),
    },
  })),

  addItemsBulk: (items) => set((state) => {
    const newItems: GroceryItem[] = items.map((item) => ({
      id: generateId(),
      name: item.name.trim(),
      price: Math.round(item.price * 100) / 100,
      splitBetween: [],
    }));
    return { trip: { ...state.trip, items: [...state.trip.items, ...newItems] } };
  }),

  setTripName: (name) => set((state) => ({
    trip: { ...state.trip, name },
  })),

  clearTrip: () => set({ trip: { ...defaultTrip, date: new Date().toISOString() } }),
}));
