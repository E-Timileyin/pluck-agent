/**
 * Nigerian mobile numbers, normalized to E.164 for storage.
 *
 *   08012345678 | 8012345678 | 2348012345678 | +234 801 234 5678 → +2348012345678
 *
 * Without this the same promoter appears three times in the dashboard and the
 * "unique promoters" tile is wrong.
 */
export function normalizePhone(raw: string): string | null {
  const d = raw.replace(/\D/g, '');
  if (d.length === 11 && d.startsWith('0')) return '+234' + d.slice(1);
  if (d.length === 10) return '+234' + d;
  if (d.length === 13 && d.startsWith('234')) return '+' + d;
  return null;
}

/** Store normalized, display formatted: +2348012345678 → 0801 234 5678 */
export function formatPhone(stored: string): string {
  const m = /^\+234(\d{3})(\d{3})(\d{4})$/.exec(stored);
  if (!m) return stored;
  return `0${m[1]} ${m[2]} ${m[3]}`;
}
