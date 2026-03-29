export type PersonId = string;
export type ItemId = string;

export interface Person {
  id: PersonId;
  name: string;
  color: string; // hex color string
}

export interface GroceryItem {
  id: ItemId;
  name: string;
  price: number; // in dollars, e.g. 12.99
  splitBetween: PersonId[]; // IDs of people splitting this item; empty = unassigned
}

export interface GroceryTrip {
  name: string;
  date: string; // ISO date string
  people: Person[];
  items: GroceryItem[];
}

export interface PersonSummary {
  person: Person;
  total: number; // rounded to 2 decimal places
  itemBreakdown: Array<{
    item: GroceryItem;
    share: number; // person's dollar share of this item
  }>;
}

export interface ParsedReceiptItem {
  name: string;
  price: number;
}
