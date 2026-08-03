import { Layout } from '../../components/common/Layout';
import { Alert } from '../../components/common/Alert';
import { QuestionCard } from '../../components/quiz/QuestionCard';
import type { Question } from '../../db/schema';

export function QuizPage(props: { question: Question; position: number; total: number }) {
  return (
    <Layout title="Quiz" step="quiz">
      <QuestionCard question={props.question} position={props.position} total={props.total} />
    </Layout>
  );
}

/** Zero active questions: an empty state, never a 0/0 attempt. */
export function QuizEmptyPage() {
  return (
    <Layout title="Quiz" step="quiz">
      <h1>No questions yet</h1>
      <Alert tone="info">
        There are no active questions in this quiz. An administrator needs to add them before you
        can continue. Nothing you have done so far is lost.
      </Alert>
      <a class="btn btn-ghost" href="/learn">
        Back to the training
      </a>
    </Layout>
  );
}

export default QuizPage;
