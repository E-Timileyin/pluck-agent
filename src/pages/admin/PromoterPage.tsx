import { Layout } from '../../components/common/Layout';
import { Alert } from '../../components/common/Alert';
import { AttemptHistory } from '../../components/admin/AttemptHistory';
import type { Answer, Attempt, Promoter } from '../../db/schema';
import { formatPhone } from '../../lib/phone';

export function PromoterPage(props: {
  promoter: Promoter;
  attempts: Attempt[];
  answersByAttempt: Map<string, Answer[]>;
}) {
  const { promoter } = props;

  return (
    <Layout title={promoter.name} variant="admin">
      <p class="eyebrow">
        <a href="/admin">← All attempts</a>
      </p>
      <h1>{promoter.name}</h1>
      <p class="muted">
        {formatPhone(promoter.phone)} · {promoter.tier}
        {promoter.email ? ` · ${promoter.email}` : ''}
      </p>

      {props.attempts.length === 0 ? (
        <Alert tone="info">No attempts yet.</Alert>
      ) : (
        <AttemptHistory attempts={props.attempts} answersByAttempt={props.answersByAttempt} />
      )}
    </Layout>
  );
}

export default PromoterPage;
