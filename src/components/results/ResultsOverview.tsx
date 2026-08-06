import { FiAward, FiCheckCircle, FiRepeat } from 'react-icons/fi';
import { StatTile } from '../common/StatTile';
import type { Attempt } from '../../db/schema';

/** Percent for one attempt, from what was stored at submission. */
export const percentOf = (attempt: Attempt): number =>
  attempt.total ? Math.round(((attempt.score ?? 0) / attempt.total) * 100) : 0;

/**
 * The three things a promoter wants from this screen before the detail: have I
 * passed, what did I score, and how many goes has it taken.
 */
export function ResultsOverview(props: { attempts: Attempt[]; passMark: number }) {
  const submitted = props.attempts.filter((a) => a.submittedAt);
  const best = submitted.reduce((top, a) => Math.max(top, percentOf(a)), 0);
  const passed = submitted.some((a) => a.passed);

  return (
    <div class="grid gap-4 sm:grid-cols-3">
      <StatTile
        Icon={FiCheckCircle}
        label="Certification"
        value={passed ? 'Passed' : submitted.length > 0 ? 'Not yet' : '—'}
        note={
          passed
            ? 'You have met the standard for your tier.'
            : `${props.passMark}% and every compliance question right.`
        }
      />
      <StatTile
        Icon={FiAward}
        label="Best score"
        value={submitted.length > 0 ? `${best}%` : '—'}
        percent={submitted.length > 0 ? best : undefined}
        note={submitted.length > 0 ? undefined : 'Nothing submitted yet.'}
      />
      <StatTile
        Icon={FiRepeat}
        label="Attempts"
        value={String(props.attempts.length)}
        note={`${submitted.length} submitted`}
      />
    </div>
  );
}

export default ResultsOverview;
