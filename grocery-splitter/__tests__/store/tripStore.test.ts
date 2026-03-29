import { useTripStore } from '../../store/tripStore';
import { GroceryTrip } from '../../store/types';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function freshTrip(): GroceryTrip {
  return {
    name: 'Test Trip',
    date: new Date().toISOString(),
    people: [],
    items: [],
  };
}

function resetStore() {
  useTripStore.setState({ trip: freshTrip() });
}

// ─── Person actions ────────────────────────────────────────────────────────────

describe('addPerson', () => {
  beforeEach(resetStore);

  it('adds a person with the correct name', () => {
    useTripStore.getState().addPerson('Alice');
    const { people } = useTripStore.getState().trip;
    expect(people).toHaveLength(1);
    expect(people[0].name).toBe('Alice');
  });

  it('trims whitespace from the name', () => {
    useTripStore.getState().addPerson('  Bob  ');
    const { people } = useTripStore.getState().trip;
    expect(people[0].name).toBe('Bob');
  });

  it('assigns a color to the new person', () => {
    useTripStore.getState().addPerson('Alice');
    const { people } = useTripStore.getState().trip;
    expect(people[0].color).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('assigns different colors to multiple people', () => {
    ['Alice', 'Bob', 'Carol'].forEach((name) =>
      useTripStore.getState().addPerson(name)
    );
    const { people } = useTripStore.getState().trip;
    const colors = people.map((p) => p.color);
    const uniqueColors = new Set(colors);
    expect(uniqueColors.size).toBe(3);
  });

  it('generates a unique ID for each person', () => {
    useTripStore.getState().addPerson('Alice');
    useTripStore.getState().addPerson('Bob');
    const { people } = useTripStore.getState().trip;
    expect(people[0].id).not.toBe(people[1].id);
  });

  it('cycles color palette after 8 people', () => {
    const names = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9'];
    names.forEach((name) => useTripStore.getState().addPerson(name));
    const { people } = useTripStore.getState().trip;
    // Person at index 8 should have the same color as person at index 0
    expect(people[8].color).toBe(people[0].color);
  });
});

describe('removePerson', () => {
  beforeEach(resetStore);

  it('removes the person by ID', () => {
    useTripStore.getState().addPerson('Alice');
    const personId = useTripStore.getState().trip.people[0].id;

    useTripStore.getState().removePerson(personId);
    expect(useTripStore.getState().trip.people).toHaveLength(0);
  });

  it('does not remove other people', () => {
    useTripStore.getState().addPerson('Alice');
    useTripStore.getState().addPerson('Bob');
    const aliceId = useTripStore.getState().trip.people[0].id;

    useTripStore.getState().removePerson(aliceId);
    const { people } = useTripStore.getState().trip;
    expect(people).toHaveLength(1);
    expect(people[0].name).toBe('Bob');
  });

  it('removes the person from items splitBetween arrays', () => {
    useTripStore.getState().addPerson('Alice');
    useTripStore.getState().addPerson('Bob');
    const state = useTripStore.getState();
    const aliceId = state.trip.people[0].id;
    const bobId = state.trip.people[1].id;

    state.addItem('Milk', 4.0);
    const itemId = useTripStore.getState().trip.items[0].id;

    useTripStore.getState().togglePersonOnItem(itemId, aliceId);
    useTripStore.getState().togglePersonOnItem(itemId, bobId);

    // Verify both are in splitBetween
    let item = useTripStore.getState().trip.items[0];
    expect(item.splitBetween).toContain(aliceId);
    expect(item.splitBetween).toContain(bobId);

    // Remove Alice
    useTripStore.getState().removePerson(aliceId);

    item = useTripStore.getState().trip.items[0];
    expect(item.splitBetween).not.toContain(aliceId);
    expect(item.splitBetween).toContain(bobId);
  });

  it('is a no-op when the person ID does not exist', () => {
    useTripStore.getState().addPerson('Alice');
    const before = useTripStore.getState().trip.people.length;
    useTripStore.getState().removePerson('nonexistent-id');
    expect(useTripStore.getState().trip.people).toHaveLength(before);
  });
});

// ─── Item actions ──────────────────────────────────────────────────────────────

describe('addItem', () => {
  beforeEach(resetStore);

  it('adds an item with the correct name', () => {
    useTripStore.getState().addItem('Eggs', 5.99);
    const { items } = useTripStore.getState().trip;
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe('Eggs');
  });

  it('trims whitespace from the item name', () => {
    useTripStore.getState().addItem('  Bacon  ', 8.0);
    expect(useTripStore.getState().trip.items[0].name).toBe('Bacon');
  });

  it('rounds the price to 2 decimal places', () => {
    useTripStore.getState().addItem('Item', 10.999);
    const { items } = useTripStore.getState().trip;
    expect(items[0].price).toBe(11.0);
  });

  it('starts with an empty splitBetween', () => {
    useTripStore.getState().addItem('Bread', 3.5);
    expect(useTripStore.getState().trip.items[0].splitBetween).toEqual([]);
  });

  it('generates a unique ID for each item', () => {
    useTripStore.getState().addItem('Eggs', 5.99);
    useTripStore.getState().addItem('Milk', 3.49);
    const { items } = useTripStore.getState().trip;
    expect(items[0].id).not.toBe(items[1].id);
  });

  it('appends items without replacing existing ones', () => {
    useTripStore.getState().addItem('Eggs', 5.99);
    useTripStore.getState().addItem('Milk', 3.49);
    expect(useTripStore.getState().trip.items).toHaveLength(2);
  });
});

describe('removeItem', () => {
  beforeEach(resetStore);

  it('removes the correct item', () => {
    useTripStore.getState().addItem('Eggs', 5.99);
    useTripStore.getState().addItem('Milk', 3.49);
    const targetId = useTripStore.getState().trip.items[0].id;

    useTripStore.getState().removeItem(targetId);
    const { items } = useTripStore.getState().trip;
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe('Milk');
  });

  it('does not affect other items', () => {
    useTripStore.getState().addItem('Eggs', 5.99);
    useTripStore.getState().addItem('Milk', 3.49);
    const secondId = useTripStore.getState().trip.items[1].id;

    useTripStore.getState().removeItem(secondId);
    expect(useTripStore.getState().trip.items[0].name).toBe('Eggs');
  });

  it('is a no-op when the item ID does not exist', () => {
    useTripStore.getState().addItem('Eggs', 5.99);
    useTripStore.getState().removeItem('nonexistent-id');
    expect(useTripStore.getState().trip.items).toHaveLength(1);
  });
});

describe('updateItem', () => {
  beforeEach(resetStore);

  it('updates the item name', () => {
    useTripStore.getState().addItem('Eegs', 5.99); // typo
    const itemId = useTripStore.getState().trip.items[0].id;

    useTripStore.getState().updateItem(itemId, { name: 'Eggs' });
    expect(useTripStore.getState().trip.items[0].name).toBe('Eggs');
  });

  it('updates the item price with rounding', () => {
    useTripStore.getState().addItem('Steak', 25.0);
    const itemId = useTripStore.getState().trip.items[0].id;

    useTripStore.getState().updateItem(itemId, { price: 30.999 });
    expect(useTripStore.getState().trip.items[0].price).toBe(31.0);
  });

  it('does not affect other items', () => {
    useTripStore.getState().addItem('Eggs', 5.99);
    useTripStore.getState().addItem('Milk', 3.49);
    const firstId = useTripStore.getState().trip.items[0].id;

    useTripStore.getState().updateItem(firstId, { price: 6.99 });
    expect(useTripStore.getState().trip.items[1].price).toBe(3.49);
  });

  it('preserves existing price when only name is updated', () => {
    useTripStore.getState().addItem('Eegs', 5.99);
    const itemId = useTripStore.getState().trip.items[0].id;

    useTripStore.getState().updateItem(itemId, { name: 'Eggs' });
    expect(useTripStore.getState().trip.items[0].price).toBe(5.99);
  });

  it('preserves splitBetween when updating name or price', () => {
    useTripStore.getState().addPerson('Alice');
    useTripStore.getState().addItem('Milk', 4.0);
    const personId = useTripStore.getState().trip.people[0].id;
    const itemId = useTripStore.getState().trip.items[0].id;

    useTripStore.getState().togglePersonOnItem(itemId, personId);
    useTripStore.getState().updateItem(itemId, { price: 4.5 });

    expect(useTripStore.getState().trip.items[0].splitBetween).toContain(personId);
  });
});

describe('togglePersonOnItem', () => {
  beforeEach(resetStore);

  it('adds person to splitBetween when not present', () => {
    useTripStore.getState().addPerson('Alice');
    useTripStore.getState().addItem('Milk', 4.0);
    const personId = useTripStore.getState().trip.people[0].id;
    const itemId = useTripStore.getState().trip.items[0].id;

    useTripStore.getState().togglePersonOnItem(itemId, personId);
    expect(useTripStore.getState().trip.items[0].splitBetween).toContain(personId);
  });

  it('removes person from splitBetween when already present', () => {
    useTripStore.getState().addPerson('Alice');
    useTripStore.getState().addItem('Milk', 4.0);
    const personId = useTripStore.getState().trip.people[0].id;
    const itemId = useTripStore.getState().trip.items[0].id;

    useTripStore.getState().togglePersonOnItem(itemId, personId); // add
    useTripStore.getState().togglePersonOnItem(itemId, personId); // remove
    expect(useTripStore.getState().trip.items[0].splitBetween).not.toContain(personId);
  });

  it('does not affect other items', () => {
    useTripStore.getState().addPerson('Alice');
    useTripStore.getState().addItem('Milk', 4.0);
    useTripStore.getState().addItem('Eggs', 5.99);
    const personId = useTripStore.getState().trip.people[0].id;
    const firstItemId = useTripStore.getState().trip.items[0].id;

    useTripStore.getState().togglePersonOnItem(firstItemId, personId);
    expect(useTripStore.getState().trip.items[1].splitBetween).toHaveLength(0);
  });

  it('allows multiple people to be added to the same item', () => {
    useTripStore.getState().addPerson('Alice');
    useTripStore.getState().addPerson('Bob');
    useTripStore.getState().addItem('Milk', 4.0);
    const aliceId = useTripStore.getState().trip.people[0].id;
    const bobId = useTripStore.getState().trip.people[1].id;
    const itemId = useTripStore.getState().trip.items[0].id;

    useTripStore.getState().togglePersonOnItem(itemId, aliceId);
    useTripStore.getState().togglePersonOnItem(itemId, bobId);
    const { splitBetween } = useTripStore.getState().trip.items[0];
    expect(splitBetween).toContain(aliceId);
    expect(splitBetween).toContain(bobId);
    expect(splitBetween).toHaveLength(2);
  });
});

describe('addItemsBulk', () => {
  beforeEach(resetStore);

  it('adds multiple items at once', () => {
    const bulkItems = [
      { name: 'Eggs', price: 5.99 },
      { name: 'Milk', price: 3.49 },
      { name: 'Bread', price: 2.99 },
    ];
    useTripStore.getState().addItemsBulk(bulkItems);
    expect(useTripStore.getState().trip.items).toHaveLength(3);
  });

  it('appends to existing items', () => {
    useTripStore.getState().addItem('Existing', 1.0);
    useTripStore.getState().addItemsBulk([{ name: 'New', price: 2.0 }]);
    expect(useTripStore.getState().trip.items).toHaveLength(2);
  });

  it('sets splitBetween to empty for each bulk item', () => {
    useTripStore.getState().addItemsBulk([{ name: 'Eggs', price: 5.99 }]);
    expect(useTripStore.getState().trip.items[0].splitBetween).toEqual([]);
  });

  it('rounds prices for bulk items', () => {
    useTripStore.getState().addItemsBulk([{ name: 'Item', price: 9.999 }]);
    expect(useTripStore.getState().trip.items[0].price).toBe(10.0);
  });

  it('trims names for bulk items', () => {
    useTripStore.getState().addItemsBulk([{ name: '  Butter  ', price: 3.5 }]);
    expect(useTripStore.getState().trip.items[0].name).toBe('Butter');
  });

  it('handles an empty array without error', () => {
    useTripStore.getState().addItemsBulk([]);
    expect(useTripStore.getState().trip.items).toHaveLength(0);
  });

  it('generates unique IDs for each bulk item', () => {
    useTripStore.getState().addItemsBulk([
      { name: 'A', price: 1.0 },
      { name: 'B', price: 2.0 },
    ]);
    const ids = useTripStore.getState().trip.items.map((i) => i.id);
    expect(new Set(ids).size).toBe(2);
  });
});

// ─── Trip actions ──────────────────────────────────────────────────────────────

describe('setTripName', () => {
  beforeEach(resetStore);

  it('updates the trip name', () => {
    useTripStore.getState().setTripName('Costco Saturday');
    expect(useTripStore.getState().trip.name).toBe('Costco Saturday');
  });

  it('does not modify other trip properties', () => {
    useTripStore.getState().addPerson('Alice');
    useTripStore.getState().setTripName('New Name');
    expect(useTripStore.getState().trip.people).toHaveLength(1);
  });
});

describe('clearTrip', () => {
  beforeEach(resetStore);

  it('resets people to empty', () => {
    useTripStore.getState().addPerson('Alice');
    useTripStore.getState().clearTrip();
    expect(useTripStore.getState().trip.people).toEqual([]);
  });

  it('resets items to empty', () => {
    useTripStore.getState().addItem('Eggs', 5.99);
    useTripStore.getState().clearTrip();
    expect(useTripStore.getState().trip.items).toEqual([]);
  });

  it('resets trip name to default', () => {
    useTripStore.getState().setTripName('Custom Name');
    useTripStore.getState().clearTrip();
    expect(useTripStore.getState().trip.name).toBe('Costco Run');
  });

  it('sets a new ISO date string after clearing', () => {
    const before = useTripStore.getState().trip.date;
    useTripStore.getState().clearTrip();
    const after = useTripStore.getState().trip.date;
    // Should be a valid ISO date string
    expect(() => new Date(after)).not.toThrow();
    expect(new Date(after).toISOString()).toBe(after);
  });
});
