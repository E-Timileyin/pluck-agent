import { FiArrowRight, FiClipboard } from 'react-icons/fi';
import { QuizArt } from './QuizArt';
import type { Resume } from '../../lib/progress';

/**
 * The one thing this screen exists to do: put the next action a tap away.
 * `href` comes from `stepFor()`, so the card can never point somewhere the
 * server would just redirect away from.
 */
export function ResumeCard(props: { resume: Resume; href: string }) {
  return (
    <section
      class="relative flex min-h-[200px] items-center overflow-hidden rounded-2xl bg-brand-deep bg-[linear-gradient(105deg,#045023_0%,#045023_55%,#023d1a_100%)] p-5 lg:p-8"
      aria-label="Continue where you left off"
    >
      <div class="relative z-10 flex items-start gap-4 lg:max-w-[62%] lg:gap-5">
        <div
          class="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white"
          aria-hidden="true"
        >
          <FiClipboard size={26} />
        </div>

        <div class="min-w-0">
        <h3 class="m-0 mb-2 text-[26px] font-bold leading-tight text-white">{props.resume.title}</h3>
        <p class="m-0 mb-5 max-w-[34ch] text-[15px]/[1.5] text-white/80">{props.resume.blurb}</p>

        <a
          class="inline-flex items-center gap-2.5 rounded-[10px] bg-white px-7 py-3.5 text-[15px] font-semibold text-brand-deep no-underline"
          href={props.href}
        >
          {props.resume.cta}
          <FiArrowRight size={18} />
        </a>
        </div>
      </div>

      {/* Bleeds slightly past the card's right padding, as drawn. */}
      <QuizArt />
    </section>
  );
}

export default ResumeCard;
