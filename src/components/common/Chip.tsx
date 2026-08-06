import type { Child } from 'hono/jsx';
import type { IconType } from 'react-icons';

/**
 * The small rounded label the comp hangs off a figure — "+12% good progress",
 * "vs last month", "ALL TIME". A pill that states a fact, never a control.
 */
export function Chip(props: {
  Icon?: IconType;
  tone?: 'good' | 'miss' | 'quiet';
  children?: Child;
}) {
  const tone = {
    good: 'bg-brand-mint text-brand-ink',
    miss: 'bg-[#ffe6e0] text-miss',
    quiet: 'border border-line bg-white text-muted',
  }[props.tone ?? 'quiet'];

  return (
    <span
      class={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${tone}`}
    >
      {props.Icon ? <props.Icon size={13} /> : null}
      {props.children}
    </span>
  );
}

export default Chip;
