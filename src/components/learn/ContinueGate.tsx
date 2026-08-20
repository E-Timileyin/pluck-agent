import { FiArrowRight, FiClock } from 'react-icons/fi';
import { formatClock } from '../../lib/format';

// Posts to /learn/:id/continue, not a shared /learn/continue, since each lesson has its own gate.
// Countdown here is display only: a disabled button is defeated in devtools, so the server re-checks elapsedSeconds itself.
export function ContinueGate(props: {
  lessonId: string;
  remainingSeconds: number;
  isLastLesson: boolean;
}) {
  const waiting = props.remainingSeconds > 0;

  return (
    // Bold full-width bar on mobile — NOT sticky: this isn't the last thing
    // on the page (the course-content list stacks below it here), so a
    // sticky-bottom bar would float and overlap whatever scrolls under it
    // rather than pinning to the viewport like a real footer would.
    <div class="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white p-3.5">
      <p class="m-0 flex min-w-0 items-center gap-2.5 text-[15px] text-muted lg:text-sm">
        <span class="flex shrink-0 text-brand" aria-hidden="true">
          <FiClock size={18} />
        </span>
        <span data-countdown={String(props.remainingSeconds)} aria-live="polite">
          {waiting
            ? `Available in ${formatClock(props.remainingSeconds)}`
            : 'You can continue when you are ready.'}
        </span>
      </p>

      <form method="post" action={`/learn/${props.lessonId}/continue`} class="min-w-full shrink-0 lg:min-w-0">
        <button
          class="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full border-0 bg-brand px-5 text-[15px] font-medium text-white transition-colors duration-150 hover:bg-brand-deep disabled:cursor-not-allowed disabled:bg-line disabled:text-muted lg:min-h-11 lg:w-auto lg:text-sm"
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
