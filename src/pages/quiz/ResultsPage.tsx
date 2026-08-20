import { PromoterShell } from '../../components/common/PromoterShell';
import { Alert } from '../../components/common/Alert';
import { Button } from '../../components/common/Button';
import { ScoreVerdict } from '../../components/quiz/ScoreVerdict';
import { AnswerReview } from '../../components/common/AnswerReview';
import type { Answer, Attempt } from '../../db/schema';
import type { Result } from '../../lib/scoring';
import type { Shell } from '../../lib/shell';
import { formatPhone } from '../../lib/phone';
import { formatClock, formatDate } from '../../lib/format';

export function ResultsPage(props: {
  shell: Shell;
  attempt: Attempt;
  answers: Answer[];
  result: Result;
  passMark: number;
  /** Set when this is a second fail in a row and the retry cooldown is still running. */
  cooldownSeconds?: number;
}) {
  const { attempt, result } = props;
  const { promoter } = props.shell;

  return (
    <PromoterShell title="Your result" shell={props.shell} active="results" showRail>
      <ScoreVerdict result={result} passMark={props.passMark} />

      {attempt.passed ? (
        <p class="m-0">
          <Button href={`/results/${attempt.id}/certificate`} tone="ghost" small>
            View certificate
          </Button>
        </p>
      ) : null}

      {result.missedCritical.length > 0 ? (
        <Alert tone="error">
          You missed {result.missedCritical.length} compliance{' '}
          {result.missedCritical.length === 1 ? 'question' : 'questions'}. These must all be correct
          to pass, whatever the overall score.
        </Alert>
      ) : null}

      <p class="muted small">
        {promoter.name} · {formatPhone(promoter.phone)} · {promoter.tier}
        {attempt.attestedAt ? ` · rules confirmed ${formatDate(attempt.attestedAt)}` : ''}
      </p>

      <h2>Review</h2>
      <AnswerReview answers={props.answers} />

      {props.cooldownSeconds ? (
        <Alert tone="error">
          That's two in a row. Take {formatClock(props.cooldownSeconds)} to go back over the
          material before the next attempt opens.
        </Alert>
      ) : null}

      <form method="post" action="/restart" class="stack">
        <button class="btn btn-ghost" type="submit">
          Take it again
        </button>
      </form>
    </PromoterShell>
  );
}

export default ResultsPage;
