import type { Child } from 'hono/jsx';
import type { IconType } from 'react-icons';

/**
 * The row every tile opens with: a round icon chip, the title, and whatever
 * sits opposite — in the comp a period dropdown, a filter, an "add" button.
 */
export function PanelHead(props: {
  Icon: IconType;
  title: string;
  /** The chip's colour. `solid` is the filled circle the stat tiles use. */
  tone?: 'soft' | 'solid' | 'miss' | 'onDark';
  aside?: Child;
}) {
  const chip = {
    soft: 'bg-brand-mint text-brand-deep',
    solid: 'bg-brand text-white',
    miss: 'bg-[#ffe6e0] text-miss',
    onDark: 'bg-white/15 text-white',
  }[props.tone ?? 'soft'];

  return (
    <div class="mb-3 flex items-center justify-between gap-3">
      <div class="flex min-w-0 items-center gap-3">
        <span class={`flex size-9 shrink-0 items-center justify-center rounded-full ${chip}`} aria-hidden="true">
          <props.Icon size={18} />
        </span>
        <h2 class="m-0 truncate text-lg font-medium text-ink lg:text-base">{props.title}</h2>
      </div>
      {props.aside ? <div class="shrink-0">{props.aside}</div> : null}
    </div>
  );
}

export default PanelHead;
