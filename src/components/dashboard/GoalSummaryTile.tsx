import { FiTarget } from 'react-icons/fi';
import { Panel } from '../common/Panel';

/**
 * The top-row echo of "Your goal" — just the number every other tile in the
 * row is chasing. The gauge and the module breakdown stay in
 * `CertificationGoal`; this tile only states the target.
 */
export function GoalSummaryTile(props: { passMark: number }) {
  return (
    <Panel class="flex h-full flex-col">
      <div class="mb-3 flex items-center gap-3">
        <span
          class="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand text-white"
          aria-hidden="true"
        >
          <FiTarget size={18} />
        </span>
        <h2 class="m-0 text-base font-semibold text-ink">Goal</h2>
      </div>

      <p class="m-0">
        <span class="inline-flex items-center rounded-full border border-line px-3 py-1.5 text-sm font-semibold text-ink">
          Pass mark {props.passMark}%
        </span>
      </p>

      <p class="m-0 mt-2 text-[13px]/[1.5] text-muted">
        Finish the training, then pass the quiz on every compliance question.
      </p>
    </Panel>
  );
}

export default GoalSummaryTile;