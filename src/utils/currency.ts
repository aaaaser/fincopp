/**
 * Utilitas format mata uang Rupiah (IDR) dan kalkulasi match donasi.
 */

export function parseDecimalToCents(value: string | number): number {
  const normalized = String(value).trim().replace(/,/g, '');
  if (!/^-?\d+(\.\d{1,2})?$/.test(normalized)) {
    throw new Error(`Format nominal tidak valid: "${value}"`);
  }

  const isNegative = normalized.startsWith('-');
  const unsigned = isNegative ? normalized.slice(1) : normalized;
  const [wholePart, decimalPart = ''] = unsigned.split('.');
  const paddedDecimal = (decimalPart + '00').slice(0, 2);

  const cents = Number(wholePart) * 100 + Number(paddedDecimal);
  return isNegative ? -cents : cents;
}

export function centsToDecimalString(cents: number): string {
  const safeCents = Math.trunc(cents);
  const isNegative = safeCents < 0;
  const absCents = Math.abs(safeCents);
  const whole = Math.floor(absCents / 100);
  const frac = String(absCents % 100).padStart(2, '0');
  return `${isNegative ? '-' : ''}${whole}.${frac}`;
}

export function formatRupiah(amount: string | number): string {
  const numeric = typeof amount === 'number' ? amount : Number(amount);
  if (Number.isNaN(numeric)) return 'Rp0';

  const cents = Math.round(numeric * 100);
  const isNegative = cents < 0;
  const absCents = Math.abs(cents);
  const whole = Math.floor(absCents / 100);
  const frac = absCents % 100;

  const formattedWhole = new Intl.NumberFormat('id-ID').format(whole);
  const suffix = frac > 0 ? `,${String(frac).padStart(2, '0')}` : '';
  return `${isNegative ? '-Rp' : 'Rp'}${formattedWhole}${suffix}`;
}

export function calculateMatchAllocation(
  donationAmount: string | number,
  pricePerMatch: string | number = 1000
): {
  matchCount: number;
  remainderRupiah: number;
} {
  const donationCents = parseDecimalToCents(donationAmount);
  const priceCents = parseDecimalToCents(pricePerMatch);

  if (donationCents < 0) {
    throw new Error('Nominal donasi tidak boleh negatif.');
  }
  if (priceCents <= 0) {
    throw new Error('Harga per match harus lebih besar dari nol.');
  }

  const matchCount = Math.floor(donationCents / priceCents);
  const remainderCents = donationCents % priceCents;

  return {
    matchCount,
    remainderRupiah: remainderCents / 100,
  };
}
