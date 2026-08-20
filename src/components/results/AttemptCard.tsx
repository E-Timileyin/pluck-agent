import { FiArrowRight, FiAward } from 'react-icons/fi';
import { Button } from '../common/Button';
import { StatusPill } from '../common/StatusPill';
import { percentOf } from './ResultsOverview';
import type { Attempt } from '../../db/schema';
import { formatDate } from '../../lib/format';

/**
 * One attempt in the promoter's own history.
 *
 * The in-progress attempt gets a link to where it actually is, which is
 * whatever `stepFor()` said — never a guess made here.
 */
export function AttemptCard(props: { attempt: Attempt; number: number; resumeHref: string }) {
  const { attempt } = props;
  const submitted = !!attempt.submittedAt;
  const percent = percentOf(attempt);

  return (
    <div class="rounded-xl border border-line p-3">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="min-w-0">
          <div class="mb-1 flex flex-wrap items-center gap-2">
            <h3 class="m-0 text-[15px] font-medium text-ink lg:text-sm">Attempt {props.number}</h3>
            {submitted ? (
              <StatusPill tone={attempt.passed ? 'pass' : 'miss'}>
                {attempt.passed ? 'Passed' : 'Not passed'}
              </StatusPill>
            ) : (
              <StatusPill>In progress</StatusPill>
            )}
          </div>

          <p class="m-0 text-sm text-muted lg:text-[13px]">
            Started {formatDate(attempt.startedAt)}
            {submitted ? ` · submitted ${formatDate(attempt.submittedAt!)}` : ''}
          </p>
        </div>

        <div class="flex shrink-0 items-center gap-4">
          {submitted ? (
            <p class="m-0 text-right">
              <span class="block text-2xl leading-none font-semibold text-ink lg:text-xl">{percent}%</span>
              <span class="mt-0.5 block text-xs text-muted lg:text-[11px]">
                {attempt.score}/{attempt.total} correct
              </span>
            </p>
          ) : null}

          {submitted && attempt.passed ? (
            <Button href={`/results/${attempt.id}/certificate`} tone="quiet" small>
              <FiAward size={16} />
              Certificate
            </Button>
          ) : null}

          <Button
            tone={submitted ? 'ghost' : 'primary'}
            href={submitted ? `/results/${attempt.id}` : props.resumeHref}
            small
          >
            {submitted ? 'Review answers' : 'Continue'}
            <FiArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AttemptCard;
