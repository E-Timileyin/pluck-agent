import { FiBookOpen, FiChevronRight, FiDownload, FiEye, FiPlay, FiTarget } from 'react-icons/fi';
import { Panel } from '../common/Panel';
import { Certificate } from '../results/Certificate';
import type { Module } from '../../lib/progress';

export type CertificateData = {
  id: string;
  promoterName: string;
  tier: string;
  score: number;
  total: number;
  percent: number;
  issuedAt: string;
  /** The standalone, print-ready page — used for the actual download/print. */
  downloadHref: string;
};

/**
 * A near-complete ring rather than a speedometer sweep — the small gap and
 * the dot both sit at the same spot the fill starts from, so at 0% only a
 * sliver shows and the ring reads as "nearly there" once it is.
 */
function Gauge(props: { percent: number; passMark: number }) {
  const r = 72;
  const circumference = 2 * Math.PI * r;
  const arc = circumference * (330 / 360);
  const filled = (arc * Math.min(100, Math.max(0, props.percent))) / 100;

  return (
    <div class="relative mx-auto flex w-full max-w-[188px] justify-center">
      <svg class="w-full" viewBox="0 0 200 200" role="img" aria-label={`${props.percent}% of the way through`}>
        <g transform="rotate(150 100 100)">
          <circle
            cx="100"
            cy="100"
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.14)"
            stroke-width="14"
            stroke-linecap="round"
            stroke-dasharray={`${arc} ${circumference}`}
          />
          <circle
            cx="100"
            cy="100"
            r={r}
            fill="none"
            stroke="var(--color-brand)"
            stroke-width="10"
            stroke-linecap="round"
            stroke-dasharray={`${filled} ${circumference}`}
          />
          <circle cx={100 + r} cy="100" r="6" fill="white" />
        </g>
      </svg>

      <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center">
        <p class="m-0 text-[13px] text-white/70">Target</p>
        <p class="m-0 text-3xl leading-none font-semibold text-white">{props.passMark}%</p>
        <p class="m-0 text-[13px] text-white/70">to be certified</p>
      </div>
    </div>
  );
}

const MODULE_CARD = 'rounded-2xl border border-line bg-white p-3 text-ink';

/**
 * The "goals" tile: just the target gauge on a dark panel, sitting above the
 * training modules — each its own compact card. No narrative text around the
 * gauge; the percentage and the target are the whole story.
 */
export function CertificationGoal(props: {
  percent: number;
  passMark: number;
  modules: Module[];
  /** Set once the promoter has a passed attempt. */
  certificate?: CertificateData;
}) {
  const { certificate } = props;

  return (
    <div class="grid gap-2">
      <Panel>
        <div class="flex items-center gap-2.5">
          <span
            class="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-brand-deep"
            aria-hidden="true"
          >
            <FiTarget size={16} />
          </span>
          <h2 class="m-0 text-base font-medium text-ink">Your goal</h2>
        </div>

        <div class="relative mt-2.5 rounded-2xl bg-brand-deep p-4">
          <Gauge percent={props.percent} passMark={props.passMark} />

          {certificate ? (
            <details class="group/cert">
              {/* Right-aligned, vertically centered on the box — an absolute
                  position rather than a flex row, since there's no header row
                  left to sit in now that the narrative text is gone. */}
              <summary class="absolute top-3.5 right-3.5 inline-flex h-7 cursor-pointer list-none items-center gap-1.5 rounded-lg bg-white/15 px-2.5 text-[12px] font-medium text-white [&::-webkit-details-marker]:hidden">
                <FiEye size={13} />
                <span class="group-open/cert:hidden">Preview</span>
                <span class="hidden group-open/cert:inline">Hide</span>
              </summary>

              {/* The real certificate, right here — not a link to another
                  page. `zoom` (not `transform`) so the layout box actually
                  shrinks to the scaled-down size instead of leaving the
                  certificate's full-size empty space behind it. */}
              <div class="mt-3 overflow-hidden rounded-xl bg-white" style="zoom: 0.4">
                <Certificate
                  certificateId={certificate.id}
                  promoterName={certificate.promoterName}
                  tier={certificate.tier}
                  score={certificate.score}
                  total={certificate.total}
                  percent={certificate.percent}
                  issuedAt={certificate.issuedAt}
                />
              </div>

              <a
                href={certificate.downloadHref}
                class="mt-2 flex min-h-9 items-center justify-center gap-2 rounded-xl border-0 bg-white/15 text-[13px] font-medium text-white no-underline transition-colors duration-150 hover:bg-white/25"
              >
                <FiDownload size={15} />
                Download certificate
              </a>
            </details>
          ) : null}
        </div>
      </Panel>

      {props.modules.map((module) => {
        const percent = Math.round(module.percent);
        const unavailable = module.state === 'unavailable';

        return (
          <div class={MODULE_CARD}>
            <form method="post" action="/learn/mode">
              <input type="hidden" name="mode" value={module.mode} />
              <button
                class="flex w-full cursor-pointer items-center gap-2.5 border-0 bg-transparent p-0 text-left disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={unavailable}
              >
                <span
                  class="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-brand-deep"
                  aria-hidden="true"
                >
                  {module.mode === 'video' ? <FiPlay size={15} /> : <FiBookOpen size={15} />}
                </span>
                <span class="min-w-0 flex-1">
                  <span class="flex items-center justify-between gap-2">
                    <span class="truncate text-[14px] font-semibold text-ink">{module.title}</span>
                    <span class="shrink-0 text-muted" aria-hidden="true">
                      <FiChevronRight size={16} />
                    </span>
                  </span>
                  <span class="mt-0.5 block truncate text-[12px] text-muted">{module.blurb}</span>
                </span>
              </button>
            </form>

            <div class="mt-1.5 flex items-center gap-2">
              <span class="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                <span class="block h-full rounded-full bg-brand" style={`width:${percent}%`}></span>
              </span>
              <span
                class={`shrink-0 text-xs font-semibold ${
                  module.state === 'completed' ? 'text-brand-ink' : 'text-muted'
                }`}
              >
                {percent}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default CertificationGoal;
