import { formatClock } from '../../lib/format';
import type { TutorialMode } from '../../db/schema';
import './ContinueGate.css';

/**
 * The countdown here is display only — the gate itself is checked server-side in
 * POST /learn/continue. A disabled button is defeated by devtools in five seconds.
 */
export function ContinueGate(props: {
  remainingSeconds: number;
  otherMode: TutorialMode | null;
}) {
  return (
    <div class="gate stack">
      <form method="post" action="/learn/continue">
        <button class="btn btn-primary" type="submit" data-gate-button>
          Continue to quiz
        </button>
      </form>

      <p class="countdown" data-countdown={String(props.remainingSeconds)} aria-live="polite">
        {props.remainingSeconds > 0
          ? `Available in ${formatClock(props.remainingSeconds)}`
          : 'You can continue when you are ready.'}
      </p>

      {props.otherMode ? (
        <form method="post" action="/learn/mode">
          <input type="hidden" name="mode" value={props.otherMode} />
          <button class="btn btn-ghost" type="submit">
            Switch to {props.otherMode}
          </button>
        </form>
      ) : null}
    </div>
  );
}

export default ContinueGate;
