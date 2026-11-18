/**
 * Utilitas aritmatika uang berbasis BigInt sen (1 IDR = 100 sen)
 * untuk menjamin akurasi mutlak Decimal(18,2) tanpa floating-point.
 */

export function decimalToCents(value: string | number | { toString(): string }): bigint {
  const raw = typeof value === 'object' ? value.toString() : String(value);
  const normalized = raw.trim().replace(/,/g, '');
  if (!/^-?\d+(\.\d{1,2})?$/.test(normalized)) {
    throw new Error(`Nominal uang tidak valid: "${raw}"`);
  }

  const isNegative = normalized.startsWith('-');
  const unsigned = isNegative ? normalized.slice(1) : normalized;
  const [wholeStr, fracStr = ''] = unsigned.split('.');
  const paddedFrac = (fracStr + '00').slice(0, 2);

  const cents = BigInt(wholeStr) * 100n + BigInt(paddedFrac);
  return isNegative ? -cents : cents;
}

export function centsToDecimalString(cents: bigint): string {
  const isNegative = cents < 0n;
  const abs = isNegative ? -cents : cents;
  const whole = abs / 100n;
  const frac = (abs % 100n).toString().padStart(2, '0');
  return `${isNegative ? '-' : ''}${whole.toString()}.${frac}`;
}

export function addDecimals(
  a: string | number | { toString(): string },
  b: string | number | { toString(): string }
): string {
  return centsToDecimalString(decimalToCents(a) + decimalToCents(b));
}

export function subtractDecimals(
  a: string | number | { toString(): string },
  b: string | number | { toString(): string }
): string {
  return centsToDecimalString(decimalToCents(a) - decimalToCents(b));
}

export function compareDecimals(
  a: string | number | { toString(): string },
  b: string | number | { toString(): string }
): -1 | 0 | 1 {
  const ca = decimalToCents(a);
  const cb = decimalToCents(b);
  if (ca < cb) return -1;
  if (ca > cb) return 1;
  return 0;
}
