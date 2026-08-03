import { AnswerReview } from '../common/AnswerReview';
import type { Answer, Attempt } from '../../db/schema';
import { formatDate } from '../../lib/format';
import './AttemptHistory.css';

export function AttemptHistory(props: {
  attempts: Attempt[];
  answersByAttempt: Map<string, Answer[]>;
}) {
  return (
    <div class="history">
      {props.attempts.map((attempt, i) => {
        const answers = props.answersByAttempt.get(attempt.id) ?? [];
        return (
          <section class="card stack">
            <h2 class="history-head">
              Attempt {props.attempts.length - i}
              {attempt.submittedAt ? (
                <span class={attempt.passed ? 'pill pill-pass' : 'pill pill-fail'}>
                  {attempt.passed ? 'Pass' : 'Fail'}
                </span>
              ) : (
                <span class="pill">In progress</span>
              )}
            </h2>
            <p class="muted small">
              Started {formatDate(attempt.startedAt)} · format {attempt.tutorialMode ?? '—'} ·{' '}
              {attempt.submittedAt ? `scored ${attempt.score}/${attempt.total}` : 'not submitted'} ·{' '}
              {attempt.attestedAt ? `rules confirmed ${formatDate(attempt.attestedAt)}` : 'not attested'}
            </p>
            {answers.length > 0 ? <AnswerReview answers={answers} compact /> : null}
          </section>
        );
      })}
    </div>
  );
}

export default AttemptHistory;
