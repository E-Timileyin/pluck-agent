/**
 * Pass / Fail / In progress, and the question flags. One component so a "Fail"
 * looks the same in the attempts table, the promoter's history and their own
 * results list.
 *
 * `miss` is the only tone that reaches for #FF2E00 — a failed attempt is the
 * same fact as a missed answer, and nothing else on these screens is red.
 */
export type PillTone = 'pass' | 'miss' | 'neutral' | 'brand';

const TONE: Record<PillTone, string> = {
  pass: 'bg-brand-mint text-brand-ink',
  miss: 'bg-[#ffe6e0] text-miss',
  neutral: 'bg-step-idle text-muted',
  brand: 'bg-brand-deep text-white',
};

export function StatusPill(props: { tone?: PillTone; children?: string }) {
  return (
    <span
      class={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${
        TONE[props.tone ?? 'neutral']
      }`}
    >
      {props.children}
    </span>
  );
}

export default StatusPill;
