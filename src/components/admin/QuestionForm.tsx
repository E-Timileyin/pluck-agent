import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Field, INPUT, TEXTAREA } from '../common/Field';

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
  title: string;
  sub: string;
  /** Shown next to the submit button when editing. */
  cancelHref?: string;
  values?: QuestionFormValues;
  errors?: Record<string, string>;
}) {
  const values = props.values ?? {};
  const errors = props.errors ?? {};
  const options = values.options ?? [];

  return (
    <Card title={props.title} sub={props.sub}>
      <form method="post" action={props.action} class="grid gap-5">
        <Field label="Question" error={errors.prompt}>
          <textarea class={TEXTAREA} name="prompt" rows={3} required>
            {values.prompt ?? ''}
          </textarea>
        </Field>

        <Field
          as="div"
          label="Options"
          hint="Fill in two to six. The selected radio is the correct answer — it is stored server-side and never rendered to a sales agent."
          error={errors.option_1 ?? errors.correctIndex}
        >
          <div class="grid gap-2">
            {SLOTS.map((i) => (
              <label class="flex items-center gap-3 rounded-xl border border-line bg-white px-3 py-2 has-checked:border-brand has-checked:bg-brand-tint">
                <input
                  class="size-6 shrink-0 accent-brand"
                  type="radio"
                  name="correctIndex"
                  value={String(i)}
                  checked={(values.correctIndex ?? 0) === i}
                  aria-label={`Option ${i + 1} is the correct answer`}
                />
                <input
                  class="h-10 min-w-0 flex-1 border-0 bg-transparent px-0 text-[15px] text-ink"
                  type="text"
                  name={`option_${i}`}
                  value={options[i] ?? ''}
                  placeholder={`Option ${i + 1}`}
                />
              </label>
            ))}
          </div>
        </Field>

        <div class="grid gap-4 sm:grid-cols-[8rem_1fr] sm:items-start">
          <Field label="Order" error={errors.orderIndex}>
            <input
              class={INPUT}
              type="number"
              name="orderIndex"
              min={0}
              max={999}
              value={String(values.orderIndex ?? 0)}
            />
          </Field>

          <div class="grid gap-2 sm:pt-7">
            <label class="flex min-h-12 cursor-pointer items-center gap-3 text-[15px] text-ink">
              <input
                class="size-6 shrink-0 accent-brand"
                type="checkbox"
                name="isCritical"
                checked={values.isCritical ?? false}
              />
              <span>
                Compliance question <span class="text-muted">— must be correct to pass</span>
              </span>
            </label>

            <label class="flex min-h-12 cursor-pointer items-center gap-3 text-[15px] text-ink">
              <input
                class="size-6 shrink-0 accent-brand"
                type="checkbox"
                name="isActive"
                checked={values.isActive ?? true}
              />
              <span>
                Active <span class="text-muted">— included in the quiz</span>
              </span>
            </label>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <Button type="submit">{props.submitLabel}</Button>
          {props.cancelHref ? (
            <Button tone="ghost" href={props.cancelHref}>
              Cancel
            </Button>
          ) : null}
        </div>
      </form>
    </Card>
  );
}

export default QuestionForm;
