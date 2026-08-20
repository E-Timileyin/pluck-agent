import { FiLogOut, FiMenu, FiX } from "react-icons/fi";
import { NotificationBell } from "./NotificationBell";
import { Avatar } from "../common/Avatar";
import { AGENT_TABS, type NavKey } from "./agentTabs";
import type { Notice } from "../../lib/notices";

export function MobileBar(props: {
  active: NavKey;
  notices: Notice[];
  name: string;
  tier: string;
  photoHref?: string;
}) {
  return (
    // No backdrop-blur here: `backdrop-filter` creates a containing block for
    // `position: fixed` descendants, which would trap the full-screen nav
    // panel below inside this bar's own small box instead of the viewport.
    <header class="sticky top-0 z-30 -mx-4 -mt-5 mb-4 border-b border-line bg-page/95 px-4 py-4 lg:hidden">
      <div class="flex items-center justify-between gap-3">
        {/* z-index'd because the open menu's nav is a sibling of summary
            further down: a positioned descendant (nav, z-20) always paints
            over an unpositioned one at the same level, no matter how deep it
            sits, so the logo needs its own stacking to stay above it too. */}
        <a class="relative z-30" href="/dashboard">
          <img class="h-10 w-auto" src="/logo-dark.png" alt="Pluck" />
        </a>

        <div class="flex items-center gap-2.5">
          <NotificationBell notices={props.notices} />

          <details class="[&[open]_.menu-open]:hidden [&:not([open])_.menu-close]:hidden">
            {/* Same reasoning as the logo: nav (z-20) is summary's sibling,
                so summary needs its own z-index above nav's to stay
                clickable and visible once the panel is open. */}
            <summary
              class="relative z-30 flex size-13 cursor-pointer list-none items-center justify-center rounded-full border border-line bg-white text-ink [&::-webkit-details-marker]:hidden"
              aria-label="Menu"
            >
              <span class="menu-open" aria-hidden="true">
                <FiMenu size={23} />
              </span>
              <span class="menu-close" aria-hidden="true">
                <FiX size={23} />
              </span>
            </summary>

            {/* Covers the full viewport, not just the details box, so the
                panel reads as a takeover rather than a small dropdown. The
                logo and the summary button above sit at a higher z-index so
                they stay visible (and summary stays clickable) over this. */}
            <nav
              class="fixed inset-0 z-20 overflow-y-auto bg-white px-6 pt-24 pb-6"
              aria-label="Sections"
            >
              <ul class="m-0 list-none p-0">
                {AGENT_TABS.map(({ key, label, href }) => {
                  const active = key === props.active;

                  return (
                    <li class="border-b border-line last:border-b-0">
                      <a
                        class={`block py-4 text-xl font-medium no-underline ${
                          active ? "text-brand" : "text-ink"
                        }`}
                        href={href}
                        aria-current={active ? "page" : undefined}
                      >
                        {label}
                      </a>
                    </li>
                  );
                })}
              </ul>

              <div class="mt-8 flex items-center gap-3 border-t border-line pt-6">
                <Avatar name={props.name} src={props.photoHref} size={38} />
                <span class="min-w-0 flex-1">
                  <span class="block truncate text-sm font-medium text-ink">
                    {props.name}
                  </span>
                  <span class="block text-[13px] text-muted">
                    {props.tier} Sales Agent
                  </span>
                </span>

                {/* Clears the attempt cookie and returns to the start form. */}
                <form method="post" action="/logout">
                  <button
                    class="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-line bg-white text-muted"
                    type="submit"
                    title="Log out"
                    aria-label="Log out"
                  >
                    <FiLogOut size={18} />
                  </button>
                </form>
              </div>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}

export default MobileBar;
