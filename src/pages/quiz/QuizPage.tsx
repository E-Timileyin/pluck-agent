import { PromoterShell } from '../../components/common/PromoterShell';
import { Alert } from '../../components/common/Alert';
import { QuestionCard } from '../../components/quiz/QuestionCard';
import type { Question } from '../../db/schema';
import type { Shell } from '../../lib/shell';

export function QuizPage(props: {
  shell: Shell;
  question: Question;
  position: number;
  total: number;
}) {
  return (
    <PromoterShell title="Quiz" shell={props.shell} active="training" showRail>
      <QuestionCard question={props.question} position={props.position} total={props.total} />
    </PromoterShell>
  );
}

/** Zero active questions: an empty state, never a 0/0 attempt. */
export function QuizEmptyPage(props: { shell: Shell }) {
  return (
    <PromoterShell title="Quiz" shell={props.shell} active="training" showRail>
      <h1>No questions yet</h1>
      <Alert tone="info">
        There are no active questions in this quiz. An administrator needs to add them before you
        can continue. Nothing you have done so far is lost.
      </Alert>
      <a class="btn btn-ghost" href="/learn">
        Back to the training
      </a>
    </PromoterShell>
  );
}

export default QuizPage;
