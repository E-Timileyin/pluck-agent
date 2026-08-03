import { Alert } from '../common/Alert';
import type { Question } from '../../db/schema';
import './QuestionList.css';

export function QuestionList(props: { questions: Question[] }) {
  if (props.questions.length === 0) {
    return <Alert tone="info">No questions yet. Add the first one above.</Alert>;
  }

  return (
    <ol class="qlist">
      {props.questions.map((q) => (
        <li class={q.isActive ? 'qitem' : 'qitem is-inactive'}>
          <div>
            <p class="qprompt">
              <span class="muted small">#{q.orderIndex}</span> {q.prompt}
              {q.isCritical ? <span class="tag tag-critical">Compliance</span> : null}
              {!q.isActive ? <span class="tag">Inactive</span> : null}
            </p>
            <p class="muted small">
              {q.options.length} options · correct: {q.options[q.correctIndex]}
            </p>
          </div>
          <div class="qactions">
            <a class="btn btn-ghost btn-small" href={`/admin/questions?edit=${q.id}`}>
              Edit
            </a>
            {/* Deactivate, never delete — deleting orphans historical answers. */}
            <form method="post" action={`/admin/questions/${q.id}/toggle`}>
              <button class="btn btn-ghost btn-small" type="submit">
                {q.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </form>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default QuestionList;
