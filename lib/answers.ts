// Answer comparison shared by Practice and the type-in test.

// Typed answers should match regardless of decimal separator or padding:
// the catalog stores "1,5" but "1.5" (or " 1,50 ") is the same answer.
export function normalizeAnswer(value: string): string {
  const trimmed = value.trim();
  if (!/^[+-]?[\d.,\s]+$/.test(trimmed)) return trimmed;
  const n = parseFloat(trimmed.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? String(n) : trimmed;
}

export function sameAnswer(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const sortedA = a.map(normalizeAnswer).sort();
  const sortedB = b.map(normalizeAnswer).sort();
  return sortedA.every((v, i) => v === sortedB[i]);
}
