import type { Child } from 'hono/jsx';
import type { IconType } from 'react-icons';
import { Panel } from '../common/Panel';
import { Chip } from '../common/Chip';

/**
 * The comp's Income/Expense tile: a filled icon circle, a period label, one
 * big figure with a smaller unit, a delta chip, and a footer that splits the
 * figure into its parts.
 */
export function FigureTile(props: {
  Icon: IconType;
  title: string;
  /** The pill opposite the title — a period, a state, a count. */
  period?: string;
  value: string;
  unit?: string;
  chip?: { text: string; tone: 'good' | 'miss' | 'quiet' };
  note?: string;
  tone?: 'brand' | 'miss';
  children?: Child;
}) {
  return (
    <Panel class="flex h-full flex-col">
      <div class="mb-3 flex items-center justify-between gap-3">
        <div class="flex min-w-0 items-center gap-3">
          <span
            class={`flex size-9 shrink-0 items-center justify-center rounded-full text-white ${
              props.tone === 'miss' ? 'bg-miss' : 'bg-brand'
            }`}
            aria-hidden="true"
          >
            <props.Icon size={18} />
          </span>
          <h2 class="m-0 truncate text-base font-semibold text-ink">{props.title}</h2>
        </div>

        {props.period ? (
          <span class="shrink-0 rounded-full border border-line px-2.5 py-1 text-[10px] font-semibold tracking-wide text-muted uppercase">
            {props.period}
          </span>
        ) : null}
      </div>

      <p class="m-0 flex flex-wrap items-baseline gap-2">
        <span class="text-[30px] leading-none font-bold tracking-tight text-ink">{props.value}</span>
        {props.unit ? <span class="text-base font-semibold text-muted">{props.unit}</span> : null}
        {props.chip ? <Chip tone={props.chip.tone}>{props.chip.text}</Chip> : null}
      </p>

      {props.note ? <p class="m-0 mt-2 text-[13px]/[1.5] text-muted">{props.note}</p> : null}

      {props.children ? (
        <div class="mt-3 border-t border-line pt-3">{props.children}</div>
      ) : null}
    </Panel>
  );
}

export default FigureTile;
