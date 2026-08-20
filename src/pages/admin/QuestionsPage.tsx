import { AdminShell } from '../../components/admin/AdminShell';
import { Alert } from '../../components/common/Alert';
import { QuestionForm, type QuestionFormValues } from '../../components/admin/QuestionForm';
import { QuestionList } from '../../components/admin/QuestionList';
import { QuestionImport } from '../../components/admin/QuestionImport';
import { TrainingMaterialCard } from '../../components/admin/TrainingMaterialCard';
import { DashboardSection } from '../../components/dashboard/DashboardSection';
import type { Admin, Question, Settings } from '../../db/schema';

export function QuestionsPage(props: {
  admin: Admin;
  questions: Question[];
  settings: Settings;
  editing?: Question;
  values?: QuestionFormValues;
  errors?: Record<string, string>;
  notice?: string;
  /** A rejected import: the pasted text, kept, and why it was refused. */
  importJson?: string;
  importErrors?: string[];
  videoError?: string;
}) {
  const { editing } = props;
  const active = props.questions.filter((q) => q.isActive).length;
  const critical = props.questions.filter((q) => q.isActive && q.isCritical).length;

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
    <AdminShell
      title="Questions"
      active="questions"
      admin={props.admin}
      sub={`${active} active of ${props.questions.length} · ${critical} must be answered correctly to pass.`}
    >
      {props.notice ? <Alert tone="info">{props.notice}</Alert> : null}

      <TrainingMaterialCard settings={props.settings} error={props.videoError} />

      <div id="question-form" class="mt-4 scroll-mt-8">
        <QuestionForm
          title={editing ? 'Edit question' : 'Add a question'}
          sub={
            editing
              ? 'Editing changes the live quiz only. Answers already given keep the snapshot they were asked with.'
              : 'Deactivate rather than delete — deleting orphans historical answers, the toggle leaves past results intact.'
          }
          action={editing ? `/admin/questions/${editing.id}` : '/admin/questions'}
          submitLabel={editing ? 'Save changes' : 'Add question'}
          cancelHref={editing ? '/admin/questions' : undefined}
          values={props.values ?? defaults}
          errors={props.errors}
        />
      </div>

      <DashboardSection
        title="Bulk import"
        collapsible
        defaultOpen={Boolean(props.importJson || (props.importErrors && props.importErrors.length > 0))}
      >
        <QuestionImport json={props.importJson} errors={props.importErrors} />
      </DashboardSection>

      <DashboardSection title={`All questions (${props.questions.length})`} collapsible>
        <QuestionList questions={props.questions} />
      </DashboardSection>
    </AdminShell>
  );
}

export default QuestionsPage;
