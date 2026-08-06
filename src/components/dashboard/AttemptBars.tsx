import { FiBarChart2 } from 'react-icons/fi';
import { Panel } from '../common/Panel';
import { PanelHead } from '../common/PanelHead';
import { Chip } from '../common/Chip';

export type Bar = { label: string; percent: number; passed: boolean | null };

/**
 * The comp's chart tile, drawn from attempts rather than cashflow: one column
 * per attempt, its height the score, brand green when it passed and #FF2E00
 * when it did not — the one screen where that red is allowed.
 *
 * Pure SVG-free markup: five divs and a percentage. A chart library for six
 * numbers would be the largest thing on the page by an order of magnitude.
 */
export function AttemptBars(props: { bars: Bar[]; passMark: number }) {
  return (
    <Panel class="flex h-full flex-col">
      <PanelHead
        Icon={FiBarChart2}
        title="Your scores"
        aside={<Chip tone="quiet">Pass mark {props.passMark}%</Chip>}
      />

      {props.bars.length === 0 ? (
        <p class="m-0 flex flex-1 items-center text-[15px] text-muted">
          Nothing scored yet. Your first result appears here as a column.
        </p>
      ) : (
        <div class="relative flex-1">
          {/* The pass mark as a line across the plot, so a column is readable
              against the rule it is judged by rather than in isolation. */}
          <div
            class="pointer-events-none absolute inset-x-0 z-10 border-t border-dashed border-line"
            style={`bottom:calc(${props.passMark}% * 0.78 + 28px)`}
            aria-hidden="true"
          ></div>

          <ol class="m-0 flex h-40 list-none items-end gap-3 p-0">
            {props.bars.map((bar) => (
              <li class="flex min-w-0 flex-1 flex-col items-center gap-2">
                <span class="text-[13px] font-semibold text-ink">{Math.round(bar.percent)}%</span>
                <span
                  class={`w-full rounded-t-xl ${
                    bar.passed === null
                      ? 'bg-step-idle'
                      : bar.passed
                        ? 'bg-brand'
                        : 'bg-miss'
                  }`}
                  style={`height:${Math.max(6, Math.round(bar.percent * 0.78))}%`}
                ></span>
                <span class="w-full truncate text-center text-[11px] text-muted">{bar.label}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </Panel>
  );
}

export default AttemptBars;
