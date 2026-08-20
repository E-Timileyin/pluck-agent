export function FilterTabs(props: {
  tabs: { key: string; label: string; href: string }[];
  active: string;
}) {
  return (
    <nav class="flex flex-wrap gap-1.5" aria-label="Filter">
      {props.tabs.map((tab) => {
        const active = tab.key === props.active;

        return (
          <a
            class={`inline-flex min-h-10 items-center rounded-full px-4 text-sm no-underline transition-colors duration-150 ${
              active
                ? "bg-brand-mint font-medium text-brand-ink"
                : "border border-line bg-white font-medium text-muted hover:text-ink"
            }`}
            href={tab.href}
            aria-current={active ? "page" : undefined}
          >
            {tab.label}
          </a>
        );
      })}
    </nav>
  );
}

export default FilterTabs;
