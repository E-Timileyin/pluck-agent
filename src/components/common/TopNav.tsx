import type { Child } from 'hono/jsx';
import type { IconType } from 'react-icons';
import { FiChevronDown } from 'react-icons/fi';
import { Avatar } from './Avatar';

export type TopTab = { key: string; label: string; href: string; Icon: IconType };

/**
 * The chrome for every screen: logo left, a centred pill nav, and the account
 * on the right. It replaces the fixed sidebar — the comp this is built from has
 * no sidebar at all, and one bar means the agent app and the console are
 * visibly the same product.
 *
 * On a phone the pills scroll sideways rather than wrapping or collapsing into
 * a menu: a horizontal scroll is discoverable by dragging, a hidden menu is not.
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
  /** The bell, or anything else that belongs beside the account. */
  actions?: Child;
}) {
  return (
    <header class="sticky top-0 z-20 border-b border-line bg-page/90 backdrop-blur">
      <div class="mx-auto flex w-full max-w-[1400px] items-center gap-4 px-4 py-3 lg:px-8">
        <a class="shrink-0" href={props.homeHref ?? '/'}>
          <img class="h-8 w-auto lg:h-9" src="/logo-dark.png" alt="Pluck" />
        </a>

        {props.tabs ? (
        <nav
          class="mx-auto flex min-w-0 flex-1 justify-start overflow-x-auto rounded-full border border-line bg-white p-1 lg:flex-none lg:justify-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Sections"
        >
          {props.tabs.map(({ key, label, href, Icon }) => {
            const active = key === props.active;

            return (
              <a
                class={`flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm no-underline transition-colors duration-150 ${
                  active
                    ? 'bg-ink font-semibold text-white'
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

          <span class="flex items-center gap-2.5 rounded-full border border-line bg-white py-1 pr-3 pl-1">
            <Avatar name={props.name} src={props.photoHref} size={34} />
            <span class="hidden min-w-0 lg:block">
              <span class="block truncate text-sm font-semibold text-ink">{props.name}</span>
              <span class="block truncate text-[11px] text-muted">{props.sub}</span>
            </span>
            <span class="hidden text-muted lg:block" aria-hidden="true">
              <FiChevronDown size={16} />
            </span>
          </span>
        </div>
      </div>
    </header>
  );
}

export default TopNav;
