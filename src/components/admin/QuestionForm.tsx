import { FieldError } from '../common/FieldError';
import './QuestionForm.css';

export type QuestionFormValues = {
  prompt?: string;
  options?: string[];
  correctIndex?: number;
  orderIndex?: number;
  isCritical?: boolean;
  isActive?: boolean;
};

const SLOTS = [0, 1, 2, 3, 4, 5];

/** The screen that justifies the database — questions are authored, not shipped. */
export function QuestionForm(props: {
  action: string;
  submitLabel: string;
  values?: QuestionFormValues;
  errors?: Record<string, string>;
}) {
  const values = props.values ?? {};
  const errors = props.errors ?? {};
  const options = values.options ?? [];

  return (
    <form method="post" action={props.action} class="card stack qform">
      <label class="field">
        <span class="label">Question</span>
        <textarea name="prompt" rows={3} required>
          {values.prompt ?? ''}
        </textarea>
        <FieldError message={errors.prompt} />
      </label>

      <fieldset class="field">
        <legend class="label">Options — fill 2 to 6, then mark the correct one</legend>
        {SLOTS.map((i) => (
          <div class="optionrow">
            <input
              type="radio"
              name="correctIndex"
              value={String(i)}
              checked={(values.correctIndex ?? 0) === i}
              aria-label={`Option ${i + 1} is the correct answer`}
            />
            <input type="text" name={`option_${i}`} value={options[i] ?? ''} placeholder={`Option ${i + 1}`} />
          </div>
        ))}
        <FieldError message={errors.option_1 ?? errors.correctIndex} />
      </fieldset>

      <div class="row">
        <label class="field field-small">
          <span class="label">Order</span>
          <input type="number" name="orderIndex" min={0} max={999} value={String(values.orderIndex ?? 0)} />
        </label>
        <label class="checkline">
          <input type="checkbox" name="isCritical" checked={values.isCritical ?? false} />
          <span>
            Compliance question <span class="muted">— must be correct to pass</span>
          </span>
        </label>
        <label class="checkline">
          <input type="checkbox" name="isActive" checked={values.isActive ?? true} />
          <span>Active</span>
        </label>
      </div>

      <button class="btn btn-primary" type="submit">
        {props.submitLabel}
      </button>
    </form>
  );
}

export default QuestionForm;
