import { ADMIN_TABS, type AdminNavKey } from './adminTabs';

/**
 * The console's navigation: one floating white capsule of icons, centred
 * against the left edge of the viewport.
 *
 * Icons only — four destinations is few enough to learn, and each carries its
 * label in `title` and in the heading of the screen it opens. The active one is
 * the filled dark disc; everything else is a bare glyph.
 *
 * Nothing else lives in here. Signing out and crossing to the agent view are
 * not sections, so they sit in the top bar with the account.
 */
export function AdminRail(props: { active: AdminNavKey }) {
  return (
    <nav
      class="pointer-events-none fixed inset-y-0 left-0 z-30 flex w-[72px] items-center justify-center"
      aria-label="Admin sections"
    >
      <ul class="pointer-events-auto m-0 flex list-none flex-col items-center gap-2 rounded-full bg-white p-2 shadow-[0_2px_18px_rgba(17,24,39,0.06)]">
        {ADMIN_TABS.map(({ key, label, href, Icon }) => {
          const active = key === props.active;

          return (
            <li>
              <a
                class={`flex size-12 items-center justify-center rounded-full no-underline transition-colors duration-150 ${
                  active ? 'bg-ink text-white' : 'text-muted hover:bg-brand-tint hover:text-ink'
                }`}
                href={href}
                title={label}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={20} />
                <span class="sr-only">{label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default AdminRail;
