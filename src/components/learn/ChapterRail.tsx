import { FiCheck, FiLock } from 'react-icons/fi';
import type { Progress, StepKey } from '../../lib/progress';
import type { TutorialMode } from '../../db/schema';

/**
 * The five steps as a chapter list: finished ones ticked, the step in hand
 * open with what it contains, the rest locked.
 *
 * The lock is honest — /learn and /quiz both re-check their own preconditions
 * on the server, so a locked step here is genuinely not reachable yet.
 */
export function ChapterRail(props: { progress: Progress; mode: TutorialMode | null }) {
  const { progress } = props;
  const currentAt = progress.steps.findIndex((s) => s.state === 'current');
  const next = progress.steps[currentAt + 1];

  /** What the open step contains — checked once that part is behind you. */
  const detail = (key: StepKey): { label: string; done: boolean }[] => {
    switch (key) {
      case 'training':
        return [
          {
            label: 'Training slides',
            done: progress.gatePassed || props.mode === 'slides',
          },
          {
            label: 'Training video',
            done: progress.gatePassed || props.mode === 'video',
          },
        ];
      case 'quiz':
        return [
          {
            label: `${progress.answered} of ${progress.totalQuestions} questions answered`,
            done: progress.totalQuestions > 0 && progress.answered >= progress.totalQuestions,
          },
        ];
      case 'attest':
        return [{ label: 'Confirm the four conduct rules', done: false }];
      default:
        return [];
    }
  };

  return (
    <section class="rounded-2xl border border-line bg-white p-4" aria-label="Your progress">
      <div class="mb-1 flex items-baseline justify-between gap-3">
        <h2 class="m-0 text-base font-semibold text-ink">Your Progress</h2>
        <a class="text-sm font-semibold text-brand no-underline hover:underline" href="/dashboard">
          See all
        </a>
      </div>
      <p class="m-0 mb-3 text-[13px] text-muted">
        {next ? `Next up — ${next.label}` : 'Last step — your result'}
      </p>

      <ol class="m-0 grid list-none gap-2 p-0">
        {progress.steps.map((step, i) => {
          const items = step.state === 'current' ? detail(step.key) : [];

          return (
            <li
              class={`rounded-xl px-3 py-2.5 ${
                step.state === 'current'
                  ? 'bg-brand text-white'
                  : step.state === 'done'
                    ? 'bg-brand-mint text-brand-ink'
                    : 'bg-step-idle text-muted'
              }`}
              aria-current={step.state === 'current' ? 'step' : undefined}
            >
              <div class="flex items-center gap-3">
                <span
                  class={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    step.state === 'current'
                      ? 'bg-white/20 text-white'
                      : step.state === 'done'
                        ? 'bg-white text-brand-ink'
                        : 'bg-white text-muted'
                  }`}
                  aria-hidden="true"
                >
                  {step.state === 'done' ? <FiCheck size={14} /> : i + 1}
                </span>

                <span class="min-w-0 flex-1 truncate text-sm font-semibold">{step.label}</span>

                {step.state === 'todo' ? (
                  <span class="shrink-0" aria-hidden="true">
                    <FiLock size={14} />
                  </span>
                ) : null}
              </div>

              {items.length > 0 ? (
                <ul class="m-0 mt-2 grid list-none gap-1.5 p-0">
                  {items.map((item) => (
                    <li class="flex items-center gap-2 rounded-lg bg-white/15 px-2.5 py-1.5 text-[13px]">
                      <span class={item.done ? 'text-white' : 'text-white/50'} aria-hidden="true">
                        <FiCheck size={13} />
                      </span>
                      <span class={item.done ? 'text-white' : 'text-white/70'}>{item.label}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export default ChapterRail;
