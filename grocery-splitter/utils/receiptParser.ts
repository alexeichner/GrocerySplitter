import { ParsedReceiptItem } from '../store/types';

// Keywords that indicate a line is NOT a product item
const NON_ITEM_KEYWORDS = [
  'total', 'subtotal', 'sub-total', 'tax', 'change', 'cash', 'credit',
  'debit', 'balance', 'amount due', 'visa', 'mastercard', 'payment',
  'thank you', 'receipt', 'member', 'savings', 'discount', 'coupon',
  'instant savings', 'cashback', 'refund', 'approved',
];

/**
 * Returns true if the line name looks like a total/tax/payment line, not a product.
 */
export function isNonItemLine(name: string): boolean {
  const lower = name.toLowerCase();
  return NON_ITEM_KEYWORDS.some((kw) => lower.includes(kw));
}

/**
 * Parse raw OCR text from a grocery receipt and extract product items with prices.
 * Handles common receipt formats like:
 *   "ORGANIC EGGS         5.99"
 *   "KIRKLAND STEAK      45.99 A"  (with trailing letters for tax codes)
 *
 * Returns a list of { name, price } objects.
 */
export function parseReceiptText(text: string): ParsedReceiptItem[] {
  const lines = text.split('\n');
  const items: ParsedReceiptItem[] = [];

  // Matches: <item name> <price> optionally followed by letters/codes
  // Price must be a positive number with exactly 2 decimal places
  const linePattern = /^(.+?)\s{2,}(\d+\.\d{2})\s*[A-Z*]?\s*$/;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const match = line.match(linePattern);
    if (!match) continue;

    const name = match[1].trim();
    const price = parseFloat(match[2]);

    if (isNaN(price) || price <= 0) continue;
    if (isNonItemLine(name)) continue;
    if (name.length < 2) continue;

    items.push({ name, price });
  }

  return items;
}

/**
 * Call Google Cloud Vision API to extract text from a base64-encoded image.
 * Returns the full text annotation string.
 * Throws an error if the API call fails.
 */
export async function extractTextFromImage(
  imageBase64: string,
  apiKey: string
): Promise<string> {
  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [
          {
            image: { content: imageBase64 },
            features: [{ type: 'TEXT_DETECTION', maxResults: 1 }],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Vision API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const text = data?.responses?.[0]?.fullTextAnnotation?.text;

  if (!text) {
    throw new Error('No text found in image');
  }

  return text;
}
