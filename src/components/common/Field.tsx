import type { Child } from 'hono/jsx';

/**
 * Label, control, hint, error — in that order, every time.
 *
 * The control classes are exported rather than applied here because the caller
 * owns the input: `<input class={INPUT} …>` keeps name, type and value where
 * you can see them instead of behind a dozen pass-through props.
 *
 * 48px minimum on every control — these forms are filled in on a phone too.
 */
export const INPUT =
  'h-12 w-full rounded-xl border border-line bg-white px-3.5 text-[15px] text-ink';

export const TEXTAREA =
  'min-h-28 w-full resize-y rounded-xl border border-line bg-white p-3.5 text-[15px]/[1.5] text-ink';

export function Field(props: {
  label: string;
  /** Renders a quiet "(optional)" after the label — say it, don't imply it. */
  optional?: boolean;
  hint?: string;
  error?: string;
  /** A fieldset when the control is a group of radios or checkboxes. */
  as?: 'label' | 'div';
  class?: string;
  children?: Child;
}) {
  const Tag = props.as === 'div' ? 'div' : 'label';

  return (
    <Tag class={`block ${props.class ?? ''}`}>
      <span class="mb-1.5 block text-sm font-medium text-ink">
        {props.label}
        {props.optional ? <span class="font-normal text-muted"> (optional)</span> : null}
      </span>

      {props.children}

      {props.hint ? <span class="mt-1.5 block text-[13px]/[1.5] text-muted">{props.hint}</span> : null}
      {props.error ? (
        <span class="mt-1.5 block text-[13px] font-medium text-miss">{props.error}</span>
      ) : null}
    </Tag>
  );
}

export default Field;
