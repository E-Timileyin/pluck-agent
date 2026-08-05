import type { IconType } from 'react-icons';
import { FiAward, FiBookOpen, FiFolder, FiHome, FiUser } from 'react-icons/fi';

export type NavKey = 'dashboard' | 'training' | 'results' | 'resources' | 'profile' | 'support';

type Tab = { key: NavKey; label: string; Icon: IconType };

/** Support is desktop-only; five tabs is already the most a phone bar can hold. */
export const TABS: Tab[] = [
  { key: 'dashboard', label: 'Dashboard', Icon: FiHome },
  { key: 'training', label: 'My Training', Icon: FiBookOpen },
  { key: 'results', label: 'My Results', Icon: FiAward },
  { key: 'resources', label: 'Resources', Icon: FiFolder },
  { key: 'profile', label: 'Profile', Icon: FiUser },
];

const BASE = 'flex h-16 flex-col items-center justify-center gap-1 text-[11px] no-underline';

/**
 * Phone chrome; the sidebar replaces it at lg. Tabs without a destination
 * render as disabled rather than as links to nowhere.
 */
export function BottomNav(props: { active: NavKey; hrefs: Partial<Record<NavKey, string>> }) {
  return (
    <nav
      class="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white pb-[env(safe-area-inset-bottom,0px)] lg:hidden"
      aria-label="Sections"
    >
      <ul class="m-0 flex list-none p-0">
        {TABS.map(({ key, label, Icon }) => {
          const href = props.hrefs[key];
          const active = key === props.active;

          const inner = (
            <>
              <Icon size={20} />
              <span class="text-center leading-tight">{label}</span>
            </>
          );

          return (
            <li class="min-w-0 flex-1">
              {href ? (
                <a
                  class={`${BASE} ${active ? 'font-semibold text-brand' : 'text-muted'}`}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                >
                  {inner}
                </a>
              ) : (
                <span class={`${BASE} text-muted opacity-50`} aria-disabled="true">
                  {inner}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default BottomNav;
