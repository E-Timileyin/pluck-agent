import { FiCheck } from 'react-icons/fi';
import type { Step } from '../../lib/progress';

/**
 * The five-stop stepper, shared by the dashboard and every training screen.
 *
 * The connector into a step is solid brand once that step has been reached and
 * dotted while it is still ahead — that contrast is what says "not yet", and a
 * uniform grey line loses it.
 */
export function StepRail(props: { steps: Step[] }) {
  return (
    <ol class="m-0 flex list-none items-start p-0">
      {props.steps.map((step, i) => {
        const reached = step.state === 'done' || step.state === 'current';

        return (
          <li class="relative flex min-w-0 flex-1 flex-col items-center">
            {i > 0 ? (
              <span
                class={`absolute top-5 right-1/2 z-0 w-full ${
                  reached ? 'border-t-2 border-brand' : 'border-t border-dotted border-line'
                }`}
                aria-hidden="true"
              ></span>
            ) : null}

            <span
              class={`relative z-10 flex size-10 items-center justify-center rounded-full text-[15px] font-medium ${
                step.state === 'done'
                  ? 'bg-brand text-white'
                  : step.state === 'current'
                    ? 'border-2 border-brand bg-white text-brand'
                    : 'bg-step-idle text-muted'
              }`}
            >
              {step.state === 'done' ? <FiCheck size={20} /> : i + 1}
            </span>

            <span
              class={`mt-2 text-center text-[11px] leading-tight lg:text-[13px] ${
                step.state === 'current' ? 'font-medium text-ink' : 'font-medium text-muted'
              }`}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export default StepRail;
