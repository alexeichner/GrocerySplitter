import { GroceryItem, GroceryTrip, PersonSummary } from '../store/types';

/**
 * Calculate how much each person owes based on the items they're splitting.
 * Each item's cost is divided equally among everyone splitting it.
 */
export function calculateSplits(trip: GroceryTrip): PersonSummary[] {
  return trip.people.map((person) => {
    const itemBreakdown = trip.items
      .filter((item) => item.splitBetween.includes(person.id))
      .map((item) => ({
        item,
        share: Math.round((item.price / item.splitBetween.length) * 100) / 100,
      }));

    const total = Math.round(
      itemBreakdown.reduce((sum, { share }) => sum + share, 0) * 100
    ) / 100;

    return { person, total, itemBreakdown };
  });
}

/**
 * Returns items that have not been assigned to anyone.
 */
export function getUnsplitItems(trip: GroceryTrip): GroceryItem[] {
  return trip.items.filter((item) => item.splitBetween.length === 0);
}

/**
 * Returns the grand total of all items in the trip.
 */
export function getTripTotal(trip: GroceryTrip): number {
  return Math.round(
    trip.items.reduce((sum, item) => sum + item.price, 0) * 100
  ) / 100;
}

/**
 * Returns the sum of all person totals (should equal getTripTotal minus unsplit items cost).
 */
export function getAssignedTotal(trip: GroceryTrip): number {
  return Math.round(
    trip.items
      .filter((item) => item.splitBetween.length > 0)
      .reduce((sum, item) => sum + item.price, 0) * 100
  ) / 100;
}

/**
 * Format a number as a currency string, e.g. 12.5 -> "$12.50"
 */
export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
