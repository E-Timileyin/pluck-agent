import { StepRail } from '../common/StepRail';
import type { Progress } from '../../lib/progress';

export function ProgressCard(props: { progress: Progress }) {
  const percent = Math.round(props.progress.percent);
  const done = props.progress.current === 'results' && percent === 100;

  return (
    /* id is the target of the sidebar's "View Progress" link. */
    <section
      id="training-progress"
      class="scroll-mt-8 rounded-2xl border border-line bg-white p-7"
      aria-label="Training progress"
    >
      <div class="flex items-start justify-between gap-4">
        <div>
          <h2 class="m-0 mb-1 text-lg font-semibold text-ink">Training Progress</h2>
          <p class="m-0 text-sm text-muted">
            {done ? 'All done. Nice work.' : "You're doing great! Keep going."}
          </p>
        </div>
        <p class="m-0 shrink-0 text-right">
          <span class="block text-[28px] font-bold leading-none text-brand">{percent}%</span>
          <span class="mt-1 block text-[13px] text-muted">Complete</span>
        </p>
      </div>

      <div
        class="my-6 h-2 overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Training progress"
      >
        <span class="block h-full rounded-full bg-brand" style={`width:${percent}%`}></span>
      </div>

      <StepRail steps={props.progress.steps} />
    </section>
  );
}

export default ProgressCard;
