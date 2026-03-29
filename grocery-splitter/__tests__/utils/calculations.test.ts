import {
  calculateSplits,
  getUnsplitItems,
  getTripTotal,
  getAssignedTotal,
  formatCurrency,
} from '../../utils/calculations';
import { GroceryTrip, Person, GroceryItem } from '../../store/types';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function makePerson(id: string, name: string): Person {
  return { id, name, color: '#000000' };
}

function makeItem(
  id: string,
  name: string,
  price: number,
  splitBetween: string[] = []
): GroceryItem {
  return { id, name, price, splitBetween };
}

function makeTrip(
  people: Person[],
  items: GroceryItem[],
  name = 'Test Trip'
): GroceryTrip {
  return { name, date: new Date().toISOString(), people, items };
}

// ─── calculateSplits ───────────────────────────────────────────────────────────

describe('calculateSplits', () => {
  it('splits an item equally between 2 people', () => {
    const alice = makePerson('alice', 'Alice');
    const bob = makePerson('bob', 'Bob');
    const item = makeItem('i1', 'Milk', 4.0, ['alice', 'bob']);
    const trip = makeTrip([alice, bob], [item]);

    const splits = calculateSplits(trip);
    const aliceSplit = splits.find((s) => s.person.id === 'alice')!;
    const bobSplit = splits.find((s) => s.person.id === 'bob')!;

    expect(aliceSplit.total).toBe(2.0);
    expect(bobSplit.total).toBe(2.0);
  });

  it('splits an item equally between 3 people', () => {
    const alice = makePerson('alice', 'Alice');
    const bob = makePerson('bob', 'Bob');
    const carol = makePerson('carol', 'Carol');
    const item = makeItem('i1', 'Pizza', 9.99, ['alice', 'bob', 'carol']);
    const trip = makeTrip([alice, bob, carol], [item]);

    const splits = calculateSplits(trip);
    const aliceSplit = splits.find((s) => s.person.id === 'alice')!;

    // 9.99 / 3 = 3.33
    expect(aliceSplit.total).toBe(3.33);
  });

  it('assigns full item cost to the only person splitting it', () => {
    const alice = makePerson('alice', 'Alice');
    const item = makeItem('i1', 'Steak', 25.0, ['alice']);
    const trip = makeTrip([alice], [item]);

    const splits = calculateSplits(trip);
    const aliceSplit = splits[0];

    expect(aliceSplit.total).toBe(25.0);
    expect(aliceSplit.itemBreakdown[0].share).toBe(25.0);
  });

  it('does not include unassigned items in any person breakdown', () => {
    const alice = makePerson('alice', 'Alice');
    const unassigned = makeItem('i1', 'Bread', 3.99, []); // no one assigned
    const trip = makeTrip([alice], [unassigned]);

    const splits = calculateSplits(trip);
    const aliceSplit = splits[0];

    expect(aliceSplit.total).toBe(0);
    expect(aliceSplit.itemBreakdown).toHaveLength(0);
  });

  it('handles multiple items per person', () => {
    const alice = makePerson('alice', 'Alice');
    const bob = makePerson('bob', 'Bob');
    const item1 = makeItem('i1', 'Eggs', 6.0, ['alice', 'bob']); // $3 each
    const item2 = makeItem('i2', 'Bacon', 10.0, ['alice']); // $10 for alice
    const item3 = makeItem('i3', 'Juice', 4.0, ['bob']); // $4 for bob
    const trip = makeTrip([alice, bob], [item1, item2, item3]);

    const splits = calculateSplits(trip);
    const aliceSplit = splits.find((s) => s.person.id === 'alice')!;
    const bobSplit = splits.find((s) => s.person.id === 'bob')!;

    expect(aliceSplit.total).toBe(13.0); // 3 + 10
    expect(bobSplit.total).toBe(7.0); // 3 + 4
  });

  it('rounds floating point shares to 2 decimal places', () => {
    // $10 split 3 ways = $3.33 each (not $3.3333...)
    const alice = makePerson('alice', 'Alice');
    const bob = makePerson('bob', 'Bob');
    const carol = makePerson('carol', 'Carol');
    const item = makeItem('i1', 'Rotisserie Chicken', 10.0, ['alice', 'bob', 'carol']);
    const trip = makeTrip([alice, bob, carol], [item]);

    const splits = calculateSplits(trip);
    splits.forEach((s) => {
      expect(s.itemBreakdown[0].share).toBe(3.33);
      expect(s.total).toBe(3.33);
    });
  });

  it('returns an empty array when there are no people', () => {
    const item = makeItem('i1', 'Milk', 5.0, []);
    const trip = makeTrip([], [item]);

    expect(calculateSplits(trip)).toEqual([]);
  });

  it('returns zero totals when there are no items', () => {
    const alice = makePerson('alice', 'Alice');
    const trip = makeTrip([alice], []);

    const splits = calculateSplits(trip);
    expect(splits[0].total).toBe(0);
    expect(splits[0].itemBreakdown).toHaveLength(0);
  });

  it('includes correct item reference in breakdown', () => {
    const alice = makePerson('alice', 'Alice');
    const item = makeItem('i1', 'Wine', 19.98, ['alice']);
    const trip = makeTrip([alice], [item]);

    const splits = calculateSplits(trip);
    expect(splits[0].itemBreakdown[0].item).toBe(item);
  });
});

// ─── getUnsplitItems ───────────────────────────────────────────────────────────

describe('getUnsplitItems', () => {
  it('returns empty array for an empty trip', () => {
    const trip = makeTrip([], []);
    expect(getUnsplitItems(trip)).toEqual([]);
  });

  it('returns empty array when all items are split', () => {
    const alice = makePerson('alice', 'Alice');
    const item = makeItem('i1', 'Cheese', 5.0, ['alice']);
    const trip = makeTrip([alice], [item]);

    expect(getUnsplitItems(trip)).toEqual([]);
  });

  it('returns only items with empty splitBetween', () => {
    const alice = makePerson('alice', 'Alice');
    const assigned = makeItem('i1', 'Bread', 3.0, ['alice']);
    const unassigned = makeItem('i2', 'Butter', 2.5, []);
    const trip = makeTrip([alice], [assigned, unassigned]);

    const unsplit = getUnsplitItems(trip);
    expect(unsplit).toHaveLength(1);
    expect(unsplit[0].id).toBe('i2');
  });

  it('returns all items when none are split', () => {
    const item1 = makeItem('i1', 'Apple', 1.0, []);
    const item2 = makeItem('i2', 'Banana', 0.5, []);
    const trip = makeTrip([], [item1, item2]);

    expect(getUnsplitItems(trip)).toHaveLength(2);
  });
});

// ─── getTripTotal ──────────────────────────────────────────────────────────────

describe('getTripTotal', () => {
  it('returns 0 for an empty trip', () => {
    const trip = makeTrip([], []);
    expect(getTripTotal(trip)).toBe(0);
  });

  it('returns the price of a single item', () => {
    const item = makeItem('i1', 'Steak', 45.99, []);
    const trip = makeTrip([], [item]);

    expect(getTripTotal(trip)).toBe(45.99);
  });

  it('sums multiple items correctly', () => {
    const items = [
      makeItem('i1', 'Eggs', 5.99, []),
      makeItem('i2', 'Bacon', 8.49, []),
      makeItem('i3', 'Bread', 3.99, []),
    ];
    const trip = makeTrip([], items);

    expect(getTripTotal(trip)).toBe(18.47);
  });

  it('includes both assigned and unassigned items', () => {
    const alice = makePerson('alice', 'Alice');
    const assigned = makeItem('i1', 'Milk', 4.0, ['alice']);
    const unassigned = makeItem('i2', 'Mystery Item', 10.0, []);
    const trip = makeTrip([alice], [assigned, unassigned]);

    expect(getTripTotal(trip)).toBe(14.0);
  });

  it('rounds to 2 decimal places', () => {
    const items = [
      makeItem('i1', 'Item A', 1.005, []),
      makeItem('i2', 'Item B', 2.005, []),
    ];
    const trip = makeTrip([], items);

    const total = getTripTotal(trip);
    // Verify it's rounded to 2 decimal places
    expect(total).toBe(Math.round((1.005 + 2.005) * 100) / 100);
  });
});

// ─── getAssignedTotal ──────────────────────────────────────────────────────────

describe('getAssignedTotal', () => {
  it('returns 0 for an empty trip', () => {
    const trip = makeTrip([], []);
    expect(getAssignedTotal(trip)).toBe(0);
  });

  it('returns 0 when no items are assigned', () => {
    const item = makeItem('i1', 'Bread', 3.5, []);
    const trip = makeTrip([], [item]);

    expect(getAssignedTotal(trip)).toBe(0);
  });

  it('only counts items with at least one person assigned', () => {
    const alice = makePerson('alice', 'Alice');
    const assigned = makeItem('i1', 'Milk', 4.0, ['alice']);
    const unassigned = makeItem('i2', 'Mystery', 99.0, []);
    const trip = makeTrip([alice], [assigned, unassigned]);

    expect(getAssignedTotal(trip)).toBe(4.0);
  });

  it('counts all assigned items', () => {
    const alice = makePerson('alice', 'Alice');
    const bob = makePerson('bob', 'Bob');
    const item1 = makeItem('i1', 'Eggs', 6.0, ['alice', 'bob']);
    const item2 = makeItem('i2', 'Steak', 30.0, ['alice']);
    const item3 = makeItem('i3', 'Unassigned', 10.0, []);
    const trip = makeTrip([alice, bob], [item1, item2, item3]);

    // 6 + 30 = 36 (not counting unassigned 10)
    expect(getAssignedTotal(trip)).toBe(36.0);
  });
});

// ─── formatCurrency ────────────────────────────────────────────────────────────

describe('formatCurrency', () => {
  it('formats a whole number', () => {
    expect(formatCurrency(100)).toBe('$100.00');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats a number with one decimal place', () => {
    expect(formatCurrency(12.5)).toBe('$12.50');
  });

  it('formats a number with two decimal places', () => {
    expect(formatCurrency(9.99)).toBe('$9.99');
  });

  it('formats a large amount', () => {
    expect(formatCurrency(1234.56)).toBe('$1234.56');
  });

  it('formats a small amount', () => {
    expect(formatCurrency(0.01)).toBe('$0.01');
  });
});
