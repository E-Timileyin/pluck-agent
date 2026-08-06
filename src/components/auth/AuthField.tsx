import type { Child } from 'hono/jsx';

/**
 * A labelled control on a sign-in screen. The label is visible rather than a
 * placeholder: a placeholder disappears the moment you type, and these forms
 * are filled in on a phone in daylight by people using them once.
 */
export function AuthField(props: {
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  as?: 'label' | 'div';
  children?: Child;
}) {
  const Tag = props.as === 'div' ? 'div' : 'label';

  return (
    <Tag class="block">
      <span class="mb-1.5 block text-sm font-semibold text-ink">
        {props.label}
        {props.optional ? <span class="font-normal text-muted"> (optional)</span> : null}
      </span>

      {props.children}

      {props.hint ? (
        <span class="mt-1.5 block text-[13px]/[1.5] text-muted">{props.hint}</span>
      ) : null}
      {props.error ? (
        <span class="mt-1.5 block text-[13px] font-semibold text-miss">{props.error}</span>
      ) : null}
    </Tag>
  );
}

export default AuthField;
