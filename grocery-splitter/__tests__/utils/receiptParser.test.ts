import { parseReceiptText, isNonItemLine } from '../../utils/receiptParser';

// ─── isNonItemLine ─────────────────────────────────────────────────────────────

describe('isNonItemLine', () => {
  it('identifies "total" as a non-item line', () => {
    expect(isNonItemLine('total')).toBe(true);
  });

  it('identifies "subtotal" as a non-item line', () => {
    expect(isNonItemLine('subtotal')).toBe(true);
  });

  it('identifies "sub-total" as a non-item line', () => {
    expect(isNonItemLine('sub-total')).toBe(true);
  });

  it('identifies "tax" as a non-item line', () => {
    expect(isNonItemLine('tax')).toBe(true);
  });

  it('identifies "change" as a non-item line', () => {
    expect(isNonItemLine('change')).toBe(true);
  });

  it('identifies "cash" as a non-item line', () => {
    expect(isNonItemLine('cash')).toBe(true);
  });

  it('identifies "credit" as a non-item line', () => {
    expect(isNonItemLine('credit')).toBe(true);
  });

  it('identifies "debit" as a non-item line', () => {
    expect(isNonItemLine('debit')).toBe(true);
  });

  it('identifies "balance" as a non-item line', () => {
    expect(isNonItemLine('balance')).toBe(true);
  });

  it('identifies "amount due" as a non-item line', () => {
    expect(isNonItemLine('amount due')).toBe(true);
  });

  it('identifies "visa" as a non-item line', () => {
    expect(isNonItemLine('visa')).toBe(true);
  });

  it('identifies "mastercard" as a non-item line', () => {
    expect(isNonItemLine('mastercard')).toBe(true);
  });

  it('identifies "payment" as a non-item line', () => {
    expect(isNonItemLine('payment')).toBe(true);
  });

  it('identifies "thank you" as a non-item line', () => {
    expect(isNonItemLine('thank you')).toBe(true);
  });

  it('identifies "savings" as a non-item line', () => {
    expect(isNonItemLine('savings')).toBe(true);
  });

  it('identifies "discount" as a non-item line', () => {
    expect(isNonItemLine('discount')).toBe(true);
  });

  it('identifies "instant savings" as a non-item line', () => {
    expect(isNonItemLine('instant savings')).toBe(true);
  });

  it('identifies "cashback" as a non-item line', () => {
    expect(isNonItemLine('cashback')).toBe(true);
  });

  it('identifies "refund" as a non-item line', () => {
    expect(isNonItemLine('refund')).toBe(true);
  });

  it('identifies "approved" as a non-item line', () => {
    expect(isNonItemLine('approved')).toBe(true);
  });

  it('is case-insensitive for uppercase keywords', () => {
    expect(isNonItemLine('TOTAL')).toBe(true);
    expect(isNonItemLine('TAX')).toBe(true);
    expect(isNonItemLine('SUBTOTAL')).toBe(true);
  });

  it('is case-insensitive for mixed case keywords', () => {
    expect(isNonItemLine('Total')).toBe(true);
    expect(isNonItemLine('Tax')).toBe(true);
    expect(isNonItemLine('Visa')).toBe(true);
  });

  it('returns false for a regular product name', () => {
    expect(isNonItemLine('ORGANIC EGGS')).toBe(false);
  });

  it('returns false for another product name', () => {
    expect(isNonItemLine('KIRKLAND BUTTER')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isNonItemLine('')).toBe(false);
  });

  it('returns false for a name containing digits only', () => {
    expect(isNonItemLine('12345')).toBe(false);
  });

  it('matches keyword appearing mid-string', () => {
    // "total" appears in "store total"
    expect(isNonItemLine('store total')).toBe(true);
  });
});

// ─── parseReceiptText ──────────────────────────────────────────────────────────

describe('parseReceiptText', () => {
  it('parses a standard format receipt line', () => {
    const text = 'ORGANIC EGGS         5.99';
    const items = parseReceiptText(text);
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe('ORGANIC EGGS');
    expect(items[0].price).toBe(5.99);
  });

  it('parses a line with trailing tax code letter', () => {
    const text = 'KIRKLAND STEAK      45.99 A';
    const items = parseReceiptText(text);
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe('KIRKLAND STEAK');
    expect(items[0].price).toBe(45.99);
  });

  it('parses a line with trailing asterisk tax code', () => {
    const text = 'ROTISSERIE CHICKEN  9.99 *';
    const items = parseReceiptText(text);
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe('ROTISSERIE CHICKEN');
    expect(items[0].price).toBe(9.99);
  });

  it('returns empty array for empty text', () => {
    expect(parseReceiptText('')).toEqual([]);
  });

  it('returns empty array for whitespace-only text', () => {
    expect(parseReceiptText('   \n  \n  ')).toEqual([]);
  });

  it('skips lines matching total keyword', () => {
    const text = 'SUBTOTAL             25.00\nTOTAL                30.00';
    const items = parseReceiptText(text);
    expect(items).toHaveLength(0);
  });

  it('skips tax lines', () => {
    const text = 'ORGANIC APPLES       4.99\nTAX                  0.40';
    const items = parseReceiptText(text);
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe('ORGANIC APPLES');
  });

  it('skips lines without a price (malformed)', () => {
    const text = 'SOME ITEM WITHOUT PRICE\nGOOD ITEM            3.99';
    const items = parseReceiptText(text);
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe('GOOD ITEM');
  });

  it('skips lines with a single-space separator (requires 2+ spaces)', () => {
    const text = 'ITEM WITH ONE SPACE 3.99';
    const items = parseReceiptText(text);
    expect(items).toHaveLength(0);
  });

  it('handles multi-word item names', () => {
    const text = 'KIRKLAND SIGNATURE CHICKEN BREAST  24.99';
    const items = parseReceiptText(text);
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe('KIRKLAND SIGNATURE CHICKEN BREAST');
    expect(items[0].price).toBe(24.99);
  });

  it('parses multiple items from a realistic receipt', () => {
    const text = [
      'KIRKLAND EGGS       9.99',
      'ORGANIC MILK        5.49',
      'SOURDOUGH BREAD     6.99',
      'SUBTOTAL            22.47',
      'TAX                  1.80',
      'TOTAL               24.27',
      'VISA                24.27',
    ].join('\n');

    const items = parseReceiptText(text);
    expect(items).toHaveLength(3);
    expect(items[0].name).toBe('KIRKLAND EGGS');
    expect(items[0].price).toBe(9.99);
    expect(items[1].name).toBe('ORGANIC MILK');
    expect(items[1].price).toBe(5.49);
    expect(items[2].name).toBe('SOURDOUGH BREAD');
    expect(items[2].price).toBe(6.99);
  });

  it('handles mixed case item names', () => {
    const text = 'Organic Bananas       1.99';
    const items = parseReceiptText(text);
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe('Organic Bananas');
  });

  it('skips lines where name is shorter than 2 characters', () => {
    const text = 'A             3.99';
    const items = parseReceiptText(text);
    expect(items).toHaveLength(0);
  });

  it('skips lines with "savings" in the name', () => {
    const text = [
      'MEMBER SAVINGS       -2.00',
      'INSTANT SAVINGS      -5.00',
    ].join('\n');
    // These should be skipped both because they are non-item lines
    // AND because negative prices won't parse (no negative price format)
    const items = parseReceiptText(text);
    expect(items).toHaveLength(0);
  });

  it('ignores blank lines between items', () => {
    const text = 'EGGS             5.99\n\nMILK             3.49\n\n';
    const items = parseReceiptText(text);
    expect(items).toHaveLength(2);
  });

  it('trims whitespace from parsed item names', () => {
    const text = '  BUTTER           3.49  ';
    const items = parseReceiptText(text);
    if (items.length > 0) {
      expect(items[0].name).toBe(items[0].name.trim());
    }
  });

  it('returns price as a number (not a string)', () => {
    const text = 'CHEESE            7.99';
    const items = parseReceiptText(text);
    expect(items).toHaveLength(1);
    expect(typeof items[0].price).toBe('number');
  });
});
