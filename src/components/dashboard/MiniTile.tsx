import type { IconType } from 'react-icons';
import { FiArrowUpRight } from 'react-icons/fi';

/**
 * The comp's pair of small squares under the promo card: a label, one line, and
 * an arrow button in the corner. The whole tile is the link.
 */
export function MiniTile(props: {
  Icon: IconType;
  label: string;
  title: string;
  href: string;
  tone?: 'plain' | 'tint';
}) {
  const surface =
    props.tone === 'tint' ? 'bg-brand-mint' : 'border border-line bg-white';

  return (
    <a
      class={`flex min-h-[104px] flex-col justify-between rounded-2xl p-3.5 no-underline transition-colors duration-150 hover:border-brand ${surface}`}
      href={props.href}
    >
      <span class="flex items-start justify-between gap-2">
        <span class="flex size-8 items-center justify-center rounded-full bg-white text-brand-deep" aria-hidden="true">
          <props.Icon size={15} />
        </span>
        <span class="flex size-7 items-center justify-center rounded-full bg-ink text-white" aria-hidden="true">
          <FiArrowUpRight size={14} />
        </span>
      </span>

      <span class="block">
        <span class="block text-[11px] font-semibold tracking-wide text-muted uppercase">
          {props.label}
        </span>
        <span class="mt-0.5 block text-sm font-semibold text-ink">{props.title}</span>
      </span>
    </a>
  );
}

export default MiniTile;
