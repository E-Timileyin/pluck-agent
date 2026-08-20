import { FiBarChart2, FiChevronDown, FiClipboard } from 'react-icons/fi';
import { Panel } from '../common/Panel';

export type Bar = { label: string; percent: number; passed: boolean | null };

/**
 * The score history chart, formerly `AttemptBars`. Same bar logic — brand
 * green for a pass, `bg-miss` for a fail — but the header is now a "Latest"
 * control rather than a pass-mark chip, and the empty state gets an icon
 * instead of just a line of text.
 */
export function ScoresPanel(props: { bars: Bar[] }) {
  return (
    <Panel class="flex flex-col">
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <span
            class="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-brand-deep"
            aria-hidden="true"
          >
            <FiBarChart2 size={18} />
          </span>
          <h2 class="m-0 text-lg font-medium text-ink lg:text-base">Your scores</h2>
        </div>

        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-1.5 text-[13px] font-medium text-ink"
        >
          Latest
          <FiChevronDown size={14} aria-hidden="true" />
        </button>
      </div>

      {props.bars.length === 0 ? (
        <div class="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center">
          <span
            class="flex size-12 items-center justify-center rounded-full bg-line text-muted"
            aria-hidden="true"
          >
            <FiClipboard size={20} />
          </span>
          <p class="m-0 text-base font-medium text-ink">Nothing scored yet</p>
          <p class="m-0 text-sm text-muted">Your first result appears here as a column.</p>
        </div>
      ) : (
        <div class="relative mt-4 flex-1">
          <ol class="m-0 flex h-40 list-none items-end gap-3 p-0">
            {props.bars.map((bar) => (
              <li class="flex min-w-0 flex-1 flex-col items-center gap-2">
                <span
                  class={`text-sm font-semibold ${
                    bar.passed === null ? 'text-ink' : bar.passed ? 'text-brand-ink' : 'text-miss'
                  }`}
                >
                  {Math.round(bar.percent)}%
                </span>
                <span
                  class={`w-full rounded-t-xl ${
                    bar.passed === null ? 'bg-step-idle' : bar.passed ? 'bg-brand' : 'bg-miss'
                  }`}
                  style={`height:${Math.max(6, Math.round(bar.percent * 0.78))}%`}
                ></span>
                <span class="w-full truncate text-center text-[12px] font-medium text-muted">{bar.label}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </Panel>
  );
}

export default ScoresPanel;
