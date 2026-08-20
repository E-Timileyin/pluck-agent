import { FiTrendingUp } from "react-icons/fi";
import { Panel } from "../common/Panel";
import { PanelHead } from "../common/PanelHead";
import { Chip } from "../common/Chip";
import type { Progress } from "../../lib/progress";

export function ProgressHero(props: { progress: Progress }) {
  const percent = Math.round(props.progress.percent);
  const done = props.progress.current === "results" && percent === 100;
  const statusText = done
    ? "Complete"
    : `${props.progress.answered}/${props.progress.totalQuestions} answered`;

  return (
    <>
      {/* Mobile: the same swoosh-card language as /learn's hero — this IS
          the progress hero already, so it gets bolder here rather than
          having a second decorative card stacked above it. */}
      <div class="relative h-full overflow-hidden rounded-[28px] bg-brand-deep p-5 text-white lg:hidden">
        <svg
          class="absolute inset-0 size-full"
          viewBox="0 0 358 220"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M -20 150 C 70 100, 120 190, 200 140 C 270 95, 320 140, 380 105 L 380 240 L -20 240 Z"
            fill="var(--color-brand)"
            opacity="0.9"
          ></path>
          <path
            d="M -20 175 C 80 135, 140 205, 220 160 C 290 125, 330 160, 380 135 L 380 240 L -20 240 Z"
            fill="var(--color-brand-mint)"
            opacity="0.25"
          ></path>
        </svg>

        <div class="relative flex items-center gap-3">
          <span
            class="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/15"
            aria-hidden="true"
          >
            <FiTrendingUp size={18} />
          </span>
          <h2 class="m-0 text-lg font-medium">Training progress</h2>
        </div>

        <p class="relative m-0 mt-4 text-[44px] leading-none font-bold tracking-tight">
          {percent}
          <span class="text-[22px] text-white/75">%</span>
        </p>

        <div class="relative mt-4 h-2 w-full overflow-hidden rounded-full bg-white/25">
          <div
            class="h-full rounded-full bg-white"
            style={`width:${percent}%`}
          ></div>
        </div>

        <p class="relative m-0 mt-4 flex flex-wrap items-center gap-2 text-sm text-white/85">
          <span class="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium whitespace-nowrap">
            <FiTrendingUp size={13} />
            {statusText}
          </span>
          {done
            ? "Training complete. Nice work."
            : "You're doing great! Keep going."}
        </p>
      </div>

      {/* Desktop: unchanged. */}
      <Panel class="hidden h-full lg:col-span-2 lg:block">
        <PanelHead Icon={FiTrendingUp} title="Training progress" />

        <p class="m-0 text-[40px] leading-none font-semibold tracking-tight text-ink">
          {percent}
          <span class="text-[24px] text-muted">%</span>
        </p>

        <div class="mt-3 h-2 w-full overflow-hidden rounded-full bg-line">
          <div
            class="h-full rounded-full bg-brand"
            style={`width:${percent}%`}
          ></div>
        </div>

        <p class="m-0 mt-3 flex flex-wrap items-center gap-2 text-[13px] text-muted">
          <Chip tone="good" Icon={FiTrendingUp}>
            {statusText}
          </Chip>
          {done
            ? "Training complete. Nice work."
            : "You're doing great! Keep going."}
        </p>
      </Panel>
    </>
  );
}

export default ProgressHero;
