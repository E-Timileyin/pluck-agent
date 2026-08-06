import type { IconType } from 'react-icons';

/**
 * One figure with its label, and optionally the bar that gives it a scale.
 * Shared, because the promoter's results screen counts the same kinds of thing
 * the console does.
 */
export function StatTile(props: {
  label: string;
  value: string;
  note?: string;
  Icon: IconType;
  /** 0–100. Draws the bar; omit it and the tile is just the figure. */
  percent?: number;
}) {
  return (
    <div class="rounded-2xl border border-line bg-white p-5">
      <div class="mb-3 flex items-center justify-between gap-3">
        <p class="m-0 text-sm font-medium text-muted">{props.label}</p>
        <span
          class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-mint text-brand-deep"
          aria-hidden="true"
        >
          <props.Icon size={18} />
        </span>
      </div>

      <p class="m-0 text-[28px] leading-none font-bold text-ink">{props.value}</p>

      {props.percent === undefined ? null : (
        <span class="mt-3 block h-2 overflow-hidden rounded-full bg-line">
          <span
            class="block h-full rounded-full bg-brand"
            style={`width:${Math.max(0, Math.min(100, Math.round(props.percent)))}%`}
          ></span>
        </span>
      )}

      {props.note ? <p class="m-0 mt-2 text-[13px] text-muted">{props.note}</p> : null}
    </div>
  );
}

export default StatTile;
