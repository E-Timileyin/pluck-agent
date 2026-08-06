import { FiAlertTriangle, FiArrowRight, FiBell, FiCheckCircle, FiClock } from 'react-icons/fi';
import type { Notice } from '../../lib/notices';

const ICON = { todo: FiClock, done: FiCheckCircle, blocked: FiAlertTriangle };

const DOT = {
  todo: 'bg-brand-mint text-brand-ink',
  done: 'bg-brand text-white',
  blocked: 'bg-[#ffe6e0] text-miss',
};

/**
 * A `<details>` element, so the panel opens and closes with no JavaScript —
 * public/app.js is the tutorial countdown and nothing else, and that stays true.
 *
 * The count is however many things are actually true about this attempt.
 */
export function NotificationBell(props: { notices: Notice[] }) {
  const count = props.notices.length;

  return (
    <details class="relative [&[open]>summary_.bell]:border-brand">
      <summary class="flex cursor-pointer list-none items-center [&::-webkit-details-marker]:hidden">
        <span class="relative inline-flex">
          <span class="bell flex size-11 items-center justify-center rounded-full border border-line bg-white text-muted transition-colors duration-150">
            <FiBell size={20} />
          </span>
          {count > 0 ? (
            <span class="absolute -top-1 -right-1 flex size-[18px] items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white">
              {count}
            </span>
          ) : null}
        </span>
        <span class="sr-only">Notifications</span>
      </summary>

      <div class="absolute right-0 z-30 mt-2 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-line bg-white">
        <p class="m-0 border-b border-line px-4 py-3 text-sm font-semibold text-ink">
          Notifications
        </p>

        {count === 0 ? (
          <p class="m-0 px-4 py-5 text-sm text-muted">Nothing needs your attention right now.</p>
        ) : (
          <ul class="m-0 list-none p-0">
            {props.notices.map((notice) => {
              const Icon = ICON[notice.tone];

              return (
                <li class="border-b border-line last:border-b-0">
                  <a
                    class="flex items-start gap-3 px-4 py-3 no-underline hover:bg-brand-tint"
                    href={notice.href}
                  >
                    <span
                      class={`flex size-8 shrink-0 items-center justify-center rounded-full ${DOT[notice.tone]}`}
                      aria-hidden="true"
                    >
                      <Icon size={16} />
                    </span>
                    <span class="min-w-0">
                      <span class="block text-sm font-semibold text-ink">{notice.title}</span>
                      <span class="block text-[13px]/[1.5] text-muted">{notice.body}</span>
                    </span>
                    <span class="mt-1 shrink-0 text-muted" aria-hidden="true">
                      <FiArrowRight size={14} />
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </details>
  );
}

export default NotificationBell;
