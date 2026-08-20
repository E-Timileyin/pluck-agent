import type { Child } from 'hono/jsx';
import type { IconType } from 'react-icons';
import { FiChevronDown, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { Avatar } from './Avatar';

export type TopTab = { key: string; label: string; href: string; Icon: IconType };

/** A row inside the mobile drawer — a link, or a form-posted action. */
export type TopNavAction = { label: string; href: string; Icon: IconType; method?: 'get' | 'post' };

/**
 * The chrome for every screen: logo left, a centred pill nav, and the account
 * on the right. It replaces the fixed sidebar — the comp this is built from has
 * no sidebar at all, and one bar means the agent app and the console are
 * visibly the same product.
 *
 * On a phone none of that fits, so it collapses to logo + hamburger — the same
 * full-screen takeover pattern as the agent app's MobileBar, with the tabs,
 * the actions and the account all moved inside it rather than left to scroll
 * or overflow.
 */
export function TopNav(props: {
  /** Omit for a bar that carries identity only — the icon rail then navigates. */
  tabs?: TopTab[];
  active?: string;
  name: string;
  /** "SP3 Sales Agent", or the admin's email. */
  sub: string;
  photoHref?: string;
  homeHref?: string;
  /** The bell, or anything else that belongs beside the account — desktop only. */
  actions?: Child;
  /** The same actions, as labelled rows inside the mobile drawer. */
  mobileActions?: TopNavAction[];
  /** POSTed form action — an icon-only button on the account row in the drawer. */
  logoutHref?: string;
}) {
  return (
    <header class="sticky top-0 z-20 border-b border-line bg-white">
      {/* Desktop bar. */}
      <div class="mx-auto hidden w-full items-center gap-4 px-4 py-3 lg:flex lg:px-8 lg:py-4">
        <a class="shrink-0" href={props.homeHref ?? '/'}>
          <img class="h-8 w-auto lg:h-10" src="/logo-dark.png" alt="Pluck" />
        </a>

        {props.tabs ? (
          <nav
            class="mx-auto flex min-w-0 flex-1 justify-start overflow-x-auto rounded-full border border-line bg-white p-1 lg:flex-none lg:justify-center lg:p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Sections"
          >
            {props.tabs.map(({ key, label, href, Icon }) => {
              const active = key === props.active;

              return (
                <a
                  class={`flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm no-underline transition-colors duration-150 lg:h-11 lg:px-5 lg:text-[15px] ${
                    active
                      ? 'bg-ink font-medium text-white'
                      : 'font-medium text-muted hover:text-ink'
                  }`}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon size={16} />
                  {label}
                </a>
              );
            })}
          </nav>
        ) : null}

        <div class="ml-auto flex shrink-0 items-center gap-2 lg:gap-3">
          {props.actions ?? null}

          <span class="flex items-center gap-2.5 rounded-full border border-line bg-white py-1 pr-3 pl-1 lg:py-1.5 lg:pr-4 lg:pl-1.5">
            <Avatar name={props.name} src={props.photoHref} size={34} />
            <span class="hidden min-w-0 lg:block">
              <span class="block truncate text-sm font-medium text-ink">{props.name}</span>
              <span class="block truncate text-[11px] text-muted">{props.sub}</span>
            </span>
            <span class="hidden text-muted lg:block" aria-hidden="true">
              <FiChevronDown size={16} />
            </span>
          </span>
        </div>
      </div>

      {/* Mobile bar: logo + hamburger. Everything else moves into the drawer. */}
      <div class="flex items-center justify-between gap-3 px-4 py-3 lg:hidden">
        <a class="relative z-30 shrink-0" href={props.homeHref ?? '/'}>
          <img class="h-8 w-auto" src="/logo-dark.png" alt="Pluck" />
        </a>

        {/* No backdrop-blur: it would create a containing block for the
            drawer's `position: fixed`, trapping it inside this bar instead
            of the viewport — same reasoning as MobileBar. */}
        <details class="[&[open]_.menu-open]:hidden [&:not([open])_.menu-close]:hidden">
          <summary
            class="relative z-30 flex size-11 cursor-pointer list-none items-center justify-center rounded-full border border-line bg-white text-ink [&::-webkit-details-marker]:hidden"
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
            class="fixed inset-0 z-20 overflow-y-auto bg-white px-6 pt-24 pb-6"
            aria-label="Sections"
          >
            {props.tabs ? (
              <ul class="m-0 list-none p-0">
                {props.tabs.map(({ key, label, href, Icon }) => {
                  const active = key === props.active;

                  return (
                    <li class="border-b border-line last:border-b-0">
                      <a
                        class={`flex items-center gap-3 py-4 text-xl font-medium no-underline ${
                          active ? 'text-brand' : 'text-ink'
                        }`}
                        href={href}
                        aria-current={active ? 'page' : undefined}
                      >
                        <Icon size={20} />
                        {label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            ) : null}

            {props.mobileActions && props.mobileActions.length > 0 ? (
              <ul class="m-0 list-none border-t border-line p-0 pt-1">
                {props.mobileActions.map((action) => (
                  <li class="border-b border-line last:border-b-0">
                    {action.method === 'post' ? (
                      <form method="post" action={action.href}>
                        <button
                          class="flex w-full cursor-pointer items-center gap-3 border-0 bg-transparent py-4 text-xl font-medium text-ink"
                          type="submit"
                        >
                          <action.Icon size={20} />
                          {action.label}
                        </button>
                      </form>
                    ) : (
                      <a
                        class="flex items-center gap-3 py-4 text-xl font-medium text-ink no-underline"
                        href={action.href}
                      >
                        <action.Icon size={20} />
                        {action.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            ) : null}

            <div class="mt-8 flex items-center gap-3 border-t border-line pt-6">
              <Avatar name={props.name} src={props.photoHref} size={38} />
              <span class="min-w-0 flex-1">
                <span class="block truncate text-sm font-medium text-ink">{props.name}</span>
                <span class="block truncate text-[13px] text-muted">{props.sub}</span>
              </span>

              {props.logoutHref ? (
                <form method="post" action={props.logoutHref}>
                  <button
                    class="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-line bg-white text-muted"
                    type="submit"
                    title="Sign out"
                    aria-label="Sign out"
                  >
                    <FiLogOut size={18} />
                  </button>
                </form>
              ) : null}
            </div>
          </nav>
        </details>
      </div>
    </header>
  );
}

export default TopNav;
