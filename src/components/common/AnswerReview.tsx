import type { Answer } from '../../db/schema';
import './AnswerReview.css';

/**
 * Rendered from question_snapshot, never from the live question — editing a
 * question must not rewrite what a past attempt was asked.
 */
export function AnswerReview(props: { answers: Answer[]; compact?: boolean }) {
  return (
    <ol class={props.compact ? 'review review-compact' : 'review'}>
      {props.answers.map((answer) => {
        const snap = answer.questionSnapshot;
        const chosen =
          answer.selectedIndex !== null && snap.options[answer.selectedIndex] !== undefined
            ? snap.options[answer.selectedIndex]
            : 'No answer';

        return (
          <li class={answer.isCorrect ? 'review-item' : 'review-item is-missed'}>
            <p class="review-prompt">
              {snap.prompt}
              {snap.isCritical ? <span class="tag tag-critical">Compliance</span> : null}
            </p>
            <p class="review-line">
              <span class="review-key">Your answer</span>
              <span>{chosen}</span>
            </p>
            {!answer.isCorrect ? (
              <p class="review-line review-correct">
                <span class="review-key">Correct</span>
                <span>{snap.options[snap.correctIndex]}</span>
              </p>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

export default AnswerReview;
