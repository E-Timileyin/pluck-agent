import type { Question } from '../../db/schema';
import './QuestionCard.css';

/**
 * One question per screen, each option its own submit button — full-width tap
 * rows, not radio dots, because agents answer one-handed, possibly standing in
 * a market. correct_index is never rendered into this markup.
 */
export function QuestionCard(props: { question: Question; position: number; total: number }) {
  const percent = Math.round((props.position / props.total) * 100);

  return (
    <div class="question">
      <p class="eyebrow">
        Question {props.position} of {props.total}
      </p>
      <div
        class="progressbar"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={props.total}
        aria-valuenow={props.position}
      >
        <span style={`width:${percent}%`}></span>
      </div>

      <h1 class="prompt">{props.question.prompt}</h1>

      <form method="post" action="/quiz/answer" class="options">
        <input type="hidden" name="questionId" value={props.question.id} />
        {props.question.options.map((option, i) => (
          <button class="option" type="submit" name="selectedIndex" value={String(i)}>
            <span class="option-key" aria-hidden="true">
              {String.fromCharCode(65 + i)}
            </span>
            <span class="option-text">{option}</span>
          </button>
        ))}
      </form>
    </div>
  );
}

export default QuestionCard;
