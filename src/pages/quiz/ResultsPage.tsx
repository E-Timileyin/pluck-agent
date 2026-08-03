import { Layout } from '../../components/common/Layout';
import { Alert } from '../../components/common/Alert';
import { ScoreVerdict } from '../../components/quiz/ScoreVerdict';
import { AnswerReview } from '../../components/common/AnswerReview';
import type { Answer, Attempt, Promoter } from '../../db/schema';
import type { Result } from '../../lib/scoring';
import { formatPhone } from '../../lib/phone';
import { formatDate } from '../../lib/format';

export function ResultsPage(props: {
  attempt: Attempt;
  promoter: Promoter;
  answers: Answer[];
  result: Result;
  passMark: number;
}) {
  const { attempt, promoter, result } = props;

  return (
    <Layout title="Your result" step="result">
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
    </Layout>
  );
}

export default ResultsPage;
