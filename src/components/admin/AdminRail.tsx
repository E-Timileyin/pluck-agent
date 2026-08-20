import { ADMIN_TABS, type AdminNavKey } from "./adminTabs";

export function AdminRail(props: { active: AdminNavKey }) {
  return (
    <nav
      class="pointer-events-none fixed inset-y-0 left-0 z-30 hidden w-[72px] items-center justify-center lg:flex"
      aria-label="Admin sections"
    >
      <ul class="pointer-events-auto m-0 flex list-none flex-col items-center gap-2 rounded-full bg-white p-2 shadow-[0_2px_18px_rgba(17,24,39,0.06)]">
        {ADMIN_TABS.map(({ key, label, href, Icon }) => {
          const active = key === props.active;

          return (
            <li>
              <a
                class={`flex size-12 items-center justify-center rounded-full no-underline transition-colors duration-150 ${
                  active
                    ? "bg-ink text-white"
                    : "text-muted hover:bg-brand-tint hover:text-ink"
                }`}
                href={href}
                title={label}
                aria-current={active ? "page" : undefined}
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
