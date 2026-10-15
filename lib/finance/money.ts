export const MAX_MXN_CENTS = 100_000_000;

export function parseMxnToCents(value: string): number | undefined {
  const normalized = value.trim().replace(/[$,\s]/g, "");
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return undefined;
  const cents = Math.round(Number(normalized) * 100);
  if (!Number.isSafeInteger(cents) || cents > MAX_MXN_CENTS) return undefined;
  return cents;
}

export function formatMxn(cents: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

