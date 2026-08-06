import { FiFileText, FiHelpCircle, FiPlayCircle } from 'react-icons/fi';
import type { Module } from '../../lib/progress';
import type { Progress } from '../../lib/progress';

type Row = {
  Icon: typeof FiFileText;
  title: string;
  meta: string;
  percent: number;
  /** A form posts the format switch; the quiz row is a plain link. */
  mode?: Module['mode'];
  href?: string;
  disabled?: boolean;
};

/**
 * The rail's second card: everything else in this training and how far through
 * it you are — the other format, and the quiz waiting at the end.
 */
export function OtherMaterial(props: { modules: Module[]; progress: Progress; mode: string | null }) {
  const rows: Row[] = props.modules
    .filter((module) => module.mode !== props.mode)
    .map((module) => ({
      Icon: module.mode === 'video' ? FiPlayCircle : FiFileText,
      title: module.title,
      meta:
        module.state === 'unavailable'
          ? 'Not published yet'
          : module.mode === 'video'
            ? 'About 60 MB of data'
            : 'Uses very little data',
      percent: module.percent,
      mode: module.mode,
      disabled: module.state === 'unavailable',
    }));

  rows.push({
    Icon: FiHelpCircle,
    title: 'The quiz',
    meta:
      props.progress.totalQuestions === 0
        ? 'No questions published yet'
        : `${props.progress.answered} of ${props.progress.totalQuestions} answered`,
    percent:
      props.progress.totalQuestions === 0
        ? 0
        : (props.progress.answered / props.progress.totalQuestions) * 100,
    href: '/quiz',
    disabled: !props.progress.gatePassed,
  });

  return (
    <section class="mt-3 rounded-2xl border border-line bg-white p-4" aria-label="Other material">
      <h2 class="m-0 text-base font-semibold text-ink">Other Material</h2>
      <p class="m-0 mb-3 text-[13px] text-muted">The rest of this training, and where you are in it.</p>

      <ul class="m-0 grid list-none gap-2 p-0">
        {rows.map((row) => {
          const body = (
            <>
              <span
                class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-mint text-brand-deep"
                aria-hidden="true"
              >
                <row.Icon size={18} />
              </span>

              <span class="min-w-0 flex-1 text-left">
                <span class="block truncate text-sm font-semibold text-ink">{row.title}</span>
                <span class="mt-0.5 block text-[13px] text-muted">{row.meta}</span>
                <span class="mt-2 block h-1.5 overflow-hidden rounded-full bg-line">
                  <span
                    class="block h-full rounded-full bg-brand"
                    style={`width:${Math.round(row.percent)}%`}
                  ></span>
                </span>
              </span>
            </>
          );

          const shell = 'flex w-full items-center gap-3 rounded-xl border border-line p-2.5';

          return (
            <li>
              {row.href ? (
                row.disabled ? (
                  <span class={`${shell} opacity-60`} aria-disabled="true">
                    {body}
                  </span>
                ) : (
                  <a class={`${shell} no-underline hover:border-brand`} href={row.href}>
                    {body}
                  </a>
                )
              ) : (
                <form method="post" action="/learn/mode">
                  <input type="hidden" name="mode" value={row.mode} />
                  <button
                    class={`${shell} cursor-pointer bg-white transition-colors duration-150 hover:border-brand disabled:cursor-not-allowed disabled:opacity-60`}
                    type="submit"
                    disabled={row.disabled}
                  >
                    {body}
                  </button>
                </form>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default OtherMaterial;
