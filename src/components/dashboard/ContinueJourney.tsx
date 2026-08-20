import { FiArrowRight, FiBookOpen, FiFolder, FiCompass } from 'react-icons/fi';
import { Panel } from '../common/Panel';
import type { Resume } from '../../lib/progress';

/**
 * The three ways forward from the dashboard: resume where you left off, or
 * jump straight to training or resources. This used to live inside
 * ProgressHero — pulling it out lets that tile stay a single number.
 */
export function ContinueJourney(props: { resume: Resume; resumeHref: string }) {
  return (
    <Panel>
      <div class="flex items-center gap-3">
        <span
          class="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-brand-deep"
          aria-hidden="true"
        >
          <FiCompass size={18} />
        </span>
        <div class="min-w-0">
          <h2 class="m-0 text-lg font-medium text-ink lg:text-base">Continue your journey</h2>
          <p class="m-0 text-sm text-muted">Pick up where you left off.</p>
        </div>
      </div>

      <div class="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
        <a
          class="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-medium text-white no-underline transition-colors duration-150 hover:bg-brand-deep"
          href={props.resumeHref}
        >
          {props.resume.cta}
          <FiArrowRight size={16} />
        </a>

        <a
          class="inline-flex min-h-11 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-medium text-white no-underline"
          href="/learn"
        >
          <FiBookOpen size={16} />
          Training
        </a>

        <a
          class="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-medium text-ink no-underline transition-colors duration-150 hover:border-brand hover:text-brand"
          href="/resources"
        >
          <FiFolder size={16} />
          Resources
        </a>
      </div>
    </Panel>
  );
}

export default ContinueJourney;
