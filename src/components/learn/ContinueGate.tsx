import { FiArrowRight, FiClock } from 'react-icons/fi';
import { formatClock } from '../../lib/format';

/**
 * The bar under the overview: one sentence about where you are, and the
 * button out of this lesson. Now posts to /learn/:id/continue instead of a
 * single /learn/continue, since each lesson has its own gate.
 *
 * The countdown here is display only — the gate itself is re-checked
 * server-side in POST /learn/:id/continue against that lesson's own
 * elapsedSeconds. A disabled button is defeated by devtools in five seconds;
 * it enabling proves nothing, the redirect on the server does.
 */
export function ContinueGate(props: {
  lessonId: string;
  remainingSeconds: number;
  isLastLesson: boolean;
}) {
  const waiting = props.remainingSeconds > 0;



  return (
    <div class="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white p-3.5">
      <p class="m-0 flex min-w-0 items-center gap-2.5 text-sm text-muted">
        <span class="flex shrink-0 text-brand" aria-hidden="true">
          <FiClock size={18} />
        </span>
        <span data-countdown={String(props.remainingSeconds)} aria-live="polite">
          {waiting
            ? `Available in ${formatClock(props.remainingSeconds)}`
            : 'You can continue when you are ready.'}
        </span>
      </p>

      <form method="post" action={`/learn/${props.lessonId}/continue`} class="shrink-0">
        <button
          class="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-0 bg-brand px-5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-brand-deep disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
          type="submit"
          disabled={waiting}
          data-gate-button
        >
          {props.isLastLesson ? 'Continue to quiz' : 'Continue to next lesson'}
          <FiArrowRight size={18} />
        </button>
      </form>
    </div>
  );
}

export default ContinueGate;