import { Card } from '../common/Card';
import { StatusPill } from '../common/StatusPill';
import { AnswerReview } from '../common/AnswerReview';
import type { Answer, Attempt } from '../../db/schema';
import { formatDate } from '../../lib/format';

/**
 * Every attempt this promoter has made, newest first, each with the answers it
 * produced — rendered from the stored snapshot, so editing a question never
 * rewrites what somebody was asked.
 */
export function AttemptHistory(props: {
  attempts: Attempt[];
  answersByAttempt: Map<string, Answer[]>;
}) {
  return (
    <div class="grid gap-4">
      {props.attempts.map((attempt, i) => {
        const answers = props.answersByAttempt.get(attempt.id) ?? [];
        const number = props.attempts.length - i;

        return (
          <Card
            title={`Attempt ${number}`}
            sub={[
              `Started ${formatDate(attempt.startedAt)}`,
              `format ${attempt.tutorialMode ?? '—'}`,
              attempt.submittedAt ? `scored ${attempt.score}/${attempt.total}` : 'not submitted',
              attempt.attestedAt
                ? `rules confirmed ${formatDate(attempt.attestedAt)}`
                : 'not attested',
            ].join(' · ')}
            aside={
              attempt.submittedAt ? (
                <StatusPill tone={attempt.passed ? 'pass' : 'miss'}>
                  {attempt.passed ? 'Pass' : 'Fail'}
                </StatusPill>
              ) : (
                <StatusPill>In progress</StatusPill>
              )
            }
          >
            {answers.length > 0 ? (
              <AnswerReview answers={answers} compact />
            ) : (
              <p class="m-0 text-[15px] text-muted">No answers recorded on this attempt.</p>
            )}
          </Card>
        );
      })}
    </div>
  );
}

export default AttemptHistory;
