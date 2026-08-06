import { FiChevronRight, FiTarget } from 'react-icons/fi';
import { Panel } from '../common/Panel';
import { PanelHead } from '../common/PanelHead';
import type { Module } from '../../lib/progress';

/** The comp's goal gauge: a 240° arc with the target figure inside it. */
function Gauge(props: { percent: number; passMark: number }) {
  const r = 72;
  const circumference = 2 * Math.PI * r;
  // 240° of a full turn, so the arc opens at the bottom like the drawing.
  const arc = circumference * (240 / 360);
  const filled = arc * Math.min(100, Math.max(0, props.percent)) / 100;

  return (
    <div class="relative mx-auto flex w-full max-w-[180px] justify-center">
      <svg class="w-full" viewBox="0 0 200 170" role="img" aria-label={`${props.percent}% of the way through`}>
        <g transform="rotate(150 100 100)">
          <circle
            cx="100"
            cy="100"
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.14)"
            stroke-width="16"
            stroke-linecap="round"
            stroke-dasharray={`${arc} ${circumference}`}
          />
          <circle
            cx="100"
            cy="100"
            r={r}
            fill="none"
            stroke="var(--color-brand)"
            stroke-width="16"
            stroke-linecap="round"
            stroke-dasharray={`${filled} ${circumference}`}
          />
        </g>
      </svg>

      <div class="absolute inset-x-0 top-[46%] -translate-y-1/2 text-center">
        <p class="m-0 text-[13px] text-white/60">Target</p>
        <p class="m-0 text-[30px] leading-none font-bold text-white">{props.passMark}%</p>
        <p class="m-0 text-[13px] text-white/60">to be certified</p>
      </div>
    </div>
  );
}

/**
 * The "goals" tile: the certification you are working towards on a dark inset
 * card, and under it the two pieces of material with their own progress.
 */
export function CertificationGoal(props: {
  percent: number;
  passMark: number;
  modules: Module[];
}) {
  return (
    <Panel class="h-full">
      <PanelHead Icon={FiTarget} title="Your goal" />

      <div class="rounded-2xl bg-brand-deep p-4">
        <p class="m-0 mb-1 text-base font-semibold text-white">Get certified</p>
        <p class="m-0 text-[13px] text-white/60">
          Finish the training, then pass the quiz on every compliance question.
        </p>
        <Gauge percent={props.percent} passMark={props.passMark} />
      </div>

      <ul class="m-0 mt-3 grid list-none gap-2 p-0">
        {props.modules.map((module) => {
          const percent = Math.round(module.percent);
          const unavailable = module.state === 'unavailable';

          return (
            <li>
              <form method="post" action="/learn/mode">
                <input type="hidden" name="mode" value={module.mode} />
                <button
                  class="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-line bg-white p-2.5 text-left transition-colors duration-150 hover:border-brand disabled:cursor-not-allowed disabled:opacity-60"
                  type="submit"
                  disabled={unavailable}
                >
                  <span class="min-w-0 flex-1">
                    <span class="block truncate text-sm font-semibold text-ink">{module.title}</span>
                    <span class="mt-2 flex items-center gap-2">
                      <span class="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                        <span
                          class="block h-full rounded-full bg-brand"
                          style={`width:${percent}%`}
                        ></span>
                      </span>
                      <span class="shrink-0 text-[11px] font-semibold text-muted">{percent}%</span>
                    </span>
                  </span>
                  <span class="shrink-0 text-muted" aria-hidden="true">
                    <FiChevronRight size={18} />
                  </span>
                </button>
              </form>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

export default CertificationGoal;
