import './FieldError.css';

/** Inline, next to the input that caused it — never a generic form-level error. */
export function FieldError(props: { message?: string }) {
  if (!props.message) return null;
  return <span class="field-error">{props.message}</span>;
}

export default FieldError;
