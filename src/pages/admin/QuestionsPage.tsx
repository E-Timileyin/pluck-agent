import { Layout } from '../../components/common/Layout';
import { Alert } from '../../components/common/Alert';
import { QuestionForm, type QuestionFormValues } from '../../components/admin/QuestionForm';
import { QuestionList } from '../../components/admin/QuestionList';
import type { Question } from '../../db/schema';

export function QuestionsPage(props: {
  questions: Question[];
  editing?: Question;
  values?: QuestionFormValues;
  errors?: Record<string, string>;
  notice?: string;
}) {
  const { editing } = props;
  const defaults: QuestionFormValues = editing
    ? {
        prompt: editing.prompt,
        options: editing.options,
        correctIndex: editing.correctIndex,
        orderIndex: editing.orderIndex,
        isCritical: editing.isCritical,
        isActive: editing.isActive,
      }
    : { isActive: true, orderIndex: props.questions.length + 1 };

  return (
    <Layout title="Questions" variant="admin">
      <h1>Questions</h1>
      <p class="lede">
        Deactivate rather than delete — deleting orphans historical answers, the toggle leaves past
        results intact.
      </p>
      {props.notice ? <Alert tone="info">{props.notice}</Alert> : null}

      <h2>{editing ? 'Edit question' : 'Add a question'}</h2>
      <QuestionForm
        action={editing ? `/admin/questions/${editing.id}` : '/admin/questions'}
        submitLabel={editing ? 'Save changes' : 'Add question'}
        values={props.values ?? defaults}
        errors={props.errors}
      />
      {editing ? (
        <p>
          <a class="btn btn-ghost btn-small" href="/admin/questions">
            Cancel edit
          </a>
        </p>
      ) : null}

      <h2>
        All questions <span class="muted small">({props.questions.length})</span>
      </h2>
      <QuestionList questions={props.questions} />
    </Layout>
  );
}

export default QuestionsPage;
