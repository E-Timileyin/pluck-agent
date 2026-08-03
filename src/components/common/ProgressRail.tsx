import './ProgressRail.css';

export type Step = 'learn' | 'quiz' | 'result';

const STEPS: { key: Step; label: string }[] = [
  { key: 'learn', label: 'Learn' },
  { key: 'quiz', label: 'Quiz' },
  { key: 'result', label: 'Result' },
];

/**
 * The signature element: a persistent Learn → Quiz → Result rail on every agent
 * screen. It is what makes this read as a course rather than a form, and on a
 * small screen it is the only thing telling a distracted agent how much is left.
 */
export function ProgressRail(props: { step?: Step }) {
  const activeAt = props.step ? STEPS.findIndex((s) => s.key === props.step) : -1;

  return (
    <nav class="rail" aria-label="Progress">
      {STEPS.map((step, i) => (
        <span
          class={`rail-step${i === activeAt ? ' is-active' : ''}${i < activeAt ? ' is-done' : ''}`}
          aria-current={i === activeAt ? 'step' : undefined}
        >
          <span class="rail-dot" aria-hidden="true">
            {i + 1}
          </span>
          <span class="rail-label">{step.label}</span>
        </span>
      ))}
    </nav>
  );
}

export default ProgressRail;
