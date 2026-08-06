import { FiArrowRight, FiFileText, FiPlayCircle } from 'react-icons/fi';
import { Card } from '../common/Card';
import { StatusPill } from '../common/StatusPill';
import type { Module } from '../../lib/progress';

/**
 * One piece of training material, opened by POST rather than by link: opening a
 * module *is* choosing that format, which is the mutation `/learn` offers. The
 * timer is stamped once on the server and switching format never resets it.
 */
export function MaterialCard(props: { module: Module }) {
  const { module } = props;
  const unavailable = module.state === 'unavailable';
  const Icon = module.mode === 'video' ? FiPlayCircle : FiFileText;

  return (
    <Card>
      <div class="flex items-start gap-4">
        <span
          class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-mint text-brand-deep"
          aria-hidden="true"
        >
          <Icon size={24} />
        </span>

        <div class="min-w-0 flex-1">
          <div class="mb-1 flex flex-wrap items-center justify-between gap-2">
            <h3 class="m-0 text-base font-semibold text-ink">{module.title}</h3>
            <StatusPill tone={module.state === 'completed' ? 'pass' : 'neutral'}>
              {module.state === 'completed'
                ? 'Completed'
                : module.state === 'in-progress'
                  ? 'In progress'
                  : module.state === 'unavailable'
                    ? 'Not published'
                    : 'Not started'}
            </StatusPill>
          </div>

          <p class="m-0 text-sm/[1.6] text-muted">
            {unavailable
              ? 'Your supervisor still has to publish this one. The other format may already be there.'
              : module.blurb}
          </p>

          {module.mode === 'video' && !unavailable ? (
            <p class="m-0 mt-2 text-[13px] text-muted">Uses about 60 MB of data.</p>
          ) : null}

          <form method="post" action="/learn/mode" class="mt-4">
            <input type="hidden" name="mode" value={module.mode} />
            <button
              class="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-xl bg-brand px-5 text-[15px] font-semibold text-white transition-colors duration-150 hover:bg-brand-deep disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
              type="submit"
              disabled={unavailable}
            >
              {module.action}
              <FiArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>
    </Card>
  );
}

export default MaterialCard;
