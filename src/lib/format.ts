/** Display helpers shared by components. Storage stays ISO/normalized. */

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.toISOString().replace("T", " ").slice(0, 16)} UTC`;
}

/**
 * Nigeria is UTC+1 year round with no DST, and a Worker's clock is UTC — so the
 * offset is a constant rather than something worth an Intl round trip.
 */
export function greetingFor(now: Date = new Date()): string {
  const hour = (now.getUTCHours() + 1) % 24;
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/** Greets by first name; a single-word name is returned whole. */
export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}

/** "23 Feb 2026" — the certificate's date of issue, not a timestamp to audit by. */
export function formatCertDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatClock(seconds: number): string {
  const m = Math.floor(Math.max(0, seconds) / 60);
  const s = Math.max(0, seconds) % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
