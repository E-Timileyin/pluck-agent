import { FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { NotificationBell } from './NotificationBell';
import { Avatar } from '../common/Avatar';
import { AGENT_TABS, type NavKey } from './agentTabs';
import type { Notice } from '../../lib/notices';

/**
 * The phone's chrome: a sticky top bar with the brand, the bell and a hamburger
 * that opens the full navigation. The sidebar replaces it from lg up.
 *
 * It is a `<details>` element, so the menu opens and closes with no JavaScript
 * — public/app.js is the tutorial countdown and nothing else, and that stays
 * true. Every destination is a real link, which also means the whole menu works
 * before any script has loaded on a 3G connection.
 *
 * This replaces a five-tab bottom bar: six destinations never fitted, and the
 * one that got cut (Support) is the one a stuck agent needs most.
 */
export function MobileBar(props: { active: NavKey; notices: Notice[]; name: string; tier: string; photoHref?: string }) {
  return (
    <header class="sticky top-0 z-30 -mx-4 mb-4 border-b border-line bg-page/95 px-4 py-3 backdrop-blur lg:hidden">
      <div class="flex items-center justify-between gap-3">
        <a href="/dashboard">
          <img class="h-8 w-auto" src="/logo-dark.png" alt="Pluck" />
        </a>

        <div class="flex items-center gap-2">
          <NotificationBell notices={props.notices} />

          <details class="relative [&[open]_.menu-open]:hidden [&:not([open])_.menu-close]:hidden">
            <summary
              class="flex size-11 cursor-pointer list-none items-center justify-center rounded-full border border-line bg-white text-ink [&::-webkit-details-marker]:hidden"
              aria-label="Menu"
            >
              <span class="menu-open" aria-hidden="true">
                <FiMenu size={20} />
              </span>
              <span class="menu-close" aria-hidden="true">
                <FiX size={20} />
              </span>
            </summary>

            <nav
              class="absolute right-0 z-40 mt-2 w-[min(17rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-line bg-white"
              aria-label="Sections"
            >
              <div class="flex items-center gap-3 border-b border-line p-3">
                <Avatar name={props.name} src={props.photoHref} size={38} />
                <span class="min-w-0">
                  <span class="block truncate text-sm font-semibold text-ink">{props.name}</span>
                  <span class="block text-[11px] text-muted">{props.tier} Sales Agent</span>
                </span>
              </div>

              <ul class="m-0 list-none p-2">
                {AGENT_TABS.map(({ key, label, href, Icon }) => {
                  const active = key === props.active;

                  return (
                    <li>
                      <a
                        class={`flex h-12 items-center gap-3 rounded-xl px-3 text-[15px] no-underline ${
                          active
                            ? 'bg-brand-mint font-semibold text-brand'
                            : 'font-medium text-ink hover:bg-brand-tint'
                        }`}
                        href={href}
                        aria-current={active ? 'page' : undefined}
                      >
                        <span class={active ? 'text-brand' : 'text-muted'} aria-hidden="true">
                          <Icon size={19} />
                        </span>
                        {label}
                      </a>
                    </li>
                  );
                })}
              </ul>

              {/* Clears the attempt cookie and returns to the start form. */}
              <form method="post" action="/restart" class="border-t border-line p-2">
                <button
                  class="flex h-12 w-full cursor-pointer items-center gap-3 rounded-xl border-0 bg-transparent px-3 text-[15px] text-muted"
                  type="submit"
                >
                  <FiLogOut size={19} />
                  Log out
                </button>
              </form>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}

export default MobileBar;
