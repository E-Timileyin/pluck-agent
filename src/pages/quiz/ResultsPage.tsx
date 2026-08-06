import { PromoterShell } from '../../components/common/PromoterShell';
import { Alert } from '../../components/common/Alert';
import { ScoreVerdict } from '../../components/quiz/ScoreVerdict';
import { AnswerReview } from '../../components/common/AnswerReview';
import type { Answer, Attempt } from '../../db/schema';
import type { Result } from '../../lib/scoring';
import type { Shell } from '../../lib/shell';
import { formatPhone } from '../../lib/phone';
import { formatDate } from '../../lib/format';

export function ResultsPage(props: {
  shell: Shell;
  attempt: Attempt;
  answers: Answer[];
  result: Result;
  passMark: number;
}) {
  const { attempt, result } = props;
  const { promoter } = props.shell;

  return (
    <PromoterShell title="Your result" shell={props.shell} active="results" showRail>
      <ScoreVerdict result={result} passMark={props.passMark} />

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

      <form method="post" action="/restart" class="stack">
        <button class="btn btn-ghost" type="submit">
          Take it again
        </button>
      </form>
    </PromoterShell>
  );
}

export default ResultsPage;
