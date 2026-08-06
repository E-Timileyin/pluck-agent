import { FiCheck, FiHelpCircle } from 'react-icons/fi';
import { StatusPill } from '../common/StatusPill';
import { Button } from '../common/Button';
import { EmptyState } from '../common/EmptyState';
import type { Question } from '../../db/schema';

export function QuestionList(props: { questions: Question[] }) {
  if (props.questions.length === 0) {
    return (
      <EmptyState
        Icon={FiHelpCircle}
        title="No questions yet"
        copy="A quiz with no active questions shows the sales agent an empty state rather than a 0/0 result. Add the first one above."
      />
    );
  }

  return (
    <ol class="m-0 grid list-none gap-3 p-0">
      {props.questions.map((q) => (
        <li
          class={`rounded-2xl border border-line bg-white p-5 ${q.isActive ? '' : 'opacity-60'}`}
        >
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="mb-2 flex flex-wrap items-center gap-2">
                <span class="rounded-md bg-step-idle px-2 py-0.5 text-xs font-semibold text-muted">
                  #{q.orderIndex}
                </span>
                {q.isCritical ? <StatusPill tone="pass">Compliance</StatusPill> : null}
                {q.isActive ? null : <StatusPill>Inactive</StatusPill>}
              </div>

              <p class="m-0 text-[15px]/[1.5] font-semibold text-ink">{q.prompt}</p>

              <ul class="m-0 mt-3 grid list-none gap-1.5 p-0">
                {q.options.map((option, i) => (
                  <li
                    class={`flex items-center gap-2 text-sm ${
                      i === q.correctIndex ? 'font-semibold text-brand-ink' : 'text-muted'
                    }`}
                  >
                    <span class="flex w-4 shrink-0 justify-center" aria-hidden="true">
                      {i === q.correctIndex ? <FiCheck size={14} /> : '·'}
                    </span>
                    {option}
                  </li>
                ))}
              </ul>
            </div>

            <div class="flex shrink-0 flex-wrap gap-2">
              <Button tone="ghost" small href={`/admin/questions?edit=${q.id}#question-form`}>
                Edit
              </Button>
              {/* Deactivate, never delete — deleting orphans historical answers. */}
              <form method="post" action={`/admin/questions/${q.id}/toggle`}>
                <Button tone={q.isActive ? 'ghost' : 'quiet'} small type="submit">
                  {q.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </form>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default QuestionList;
