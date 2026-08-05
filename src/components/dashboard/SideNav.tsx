import { FiArrowRight, FiChevronDown, FiHelpCircle, FiLogOut } from 'react-icons/fi';
import { TABS, type NavKey } from './BottomNav';

/** 56px ring, 60% sweep in brand on a line track, with the figure centred. */
function Donut(props: { percent: number }) {
  const r = 24;
  const c = 2 * Math.PI * r;

  return (
    <span class="relative flex size-14 shrink-0 items-center justify-center">
      <svg class="size-14 -rotate-90" viewBox="0 0 56 56" aria-hidden="true">
        <circle cx="28" cy="28" r={r} fill="none" stroke="var(--color-line)" stroke-width="5" />
        <circle
          cx="28"
          cy="28"
          r={r}
          fill="none"
          stroke="var(--color-brand)"
          stroke-width="5"
          stroke-linecap="round"
          stroke-dasharray={`${(c * props.percent) / 100} ${c}`}
        />
      </svg>
      <span class="absolute text-[13px] font-bold text-ink">{props.percent}%</span>
    </span>
  );
}

/**
 * Desktop sidebar: fixed, full height, flush to the viewport edge. Below lg it
 * is not rendered to the screen at all — BottomNav takes over.
 *
 * Tabs without a destination render as disabled rather than as links to
 * nowhere: Resources, Profile and Support are not built, and My Results only
 * exists once an attempt has been submitted.
 */
export function SideNav(props: {
  active: NavKey;
  hrefs: Partial<Record<NavKey, string>>;
  name: string;
  tier: string;
  percent: number;
}) {
  const percent = Math.round(props.percent);
  const initials = props.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  const tabs = [...TABS, { key: 'support' as NavKey, label: 'Support', Icon: FiHelpCircle }];

  return (
    <aside class="fixed inset-y-0 left-0 z-20 hidden w-[300px] flex-col border-r border-line bg-white p-5 lg:flex">
      <img class="mb-4 w-[160px] px-3 pt-2" src="/logo-dark.png" alt="Pluck" />

      <nav aria-label="Sections">
        <ul class="m-0 flex list-none flex-col gap-1.5 p-0">
          {tabs.map(({ key, label, Icon }) => {
            const href = props.hrefs[key];
            const active = key === props.active;

            const inner = (
              <>
                <span class={active ? 'text-brand' : 'text-muted'} aria-hidden="true">
                  <Icon size={20} />
                </span>
                {label}
              </>
            );

            const base =
              'flex h-12 items-center gap-3.5 rounded-[10px] px-3.5 text-base no-underline transition-colors duration-150';

            return (
              <li>
                {href ? (
                  <a
                    class={`${base} ${
                      active
                        ? 'bg-brand-mint font-semibold text-brand'
                        : 'font-medium text-ink hover:bg-brand-tint'
                    }`}
                    href={href}
                    aria-current={active ? 'page' : undefined}
                  >
                    {inner}
                  </a>
                ) : (
                  <span class={`${base} cursor-not-allowed font-medium text-ink`} aria-disabled="true">
                    {inner}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div class="mt-8 rounded-2xl bg-brand-tint p-4">
        <div class="flex items-start gap-3">
          <Donut percent={percent} />
          <div class="min-w-0">
            <p class="m-0 mb-1 text-base font-semibold text-ink">Keep Going!</p>
            <p class="m-0 text-[13px]/[1.5] text-muted">
              Complete your training and pass the quiz to get certified.
            </p>
          </div>
        </div>

        <a
          class="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand no-underline hover:underline"
          href="#training-progress"
        >
          View Progress
          <FiArrowRight size={16} />
        </a>
      </div>

      <div class="mt-auto">
        <div class="flex items-center gap-3 px-1 py-2">
          <span
            class="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-deep text-sm font-semibold text-white"
            aria-hidden="true"
          >
            {initials}
          </span>
          <span class="min-w-0 flex-1">
            <span class="block truncate text-sm font-semibold text-ink">{props.name}</span>
            <span class="block text-xs text-muted">{props.tier} Promoter</span>
          </span>
          <span class="shrink-0 text-muted" aria-hidden="true">
            <FiChevronDown size={18} />
          </span>
        </div>

        {/* Clears the attempt cookie and returns to the start form. */}
        <form method="post" action="/restart" class="mt-2 border-t border-line pt-2">
          <button
            class="flex h-11 w-full cursor-pointer items-center gap-3 rounded-[10px] border-0 bg-transparent px-3 text-sm text-muted transition-colors duration-150 hover:bg-brand-tint"
            type="submit"
          >
            <FiLogOut size={20} />
            Log out
          </button>
        </form>
      </div>
    </aside>
  );
}

export default SideNav;
