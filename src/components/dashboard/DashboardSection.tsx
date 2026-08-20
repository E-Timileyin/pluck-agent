import { FiChevronDown } from 'react-icons/fi';
import type { Child } from 'hono/jsx';

/**
 * Heading plus its block. Exists so the page stays a composition root — a bare
 * <h2> in DashboardPage would be the first crack in that rule.
 *
 * `collapsible` swaps the heading for a `<summary>` inside a native `<details>`
 * — no JS needed to open/close, and the closed state is real: content past a
 * closed `<details>` isn't rendered visible, not just visually hidden.
 */
export function DashboardSection(props: {
  title: string;
  children?: Child;
  collapsible?: boolean;
  defaultOpen?: boolean;
}) {
  if (props.collapsible) {
    return (
      <section class="mt-5">
        <details open={props.defaultOpen} class="group">
          <summary class="m-0 mb-2.5 flex cursor-pointer list-none items-center gap-2 text-base font-medium text-ink [&::-webkit-details-marker]:hidden">
            <span class="shrink-0 text-muted transition-transform duration-150 group-open:rotate-180" aria-hidden="true">
              <FiChevronDown size={18} />
            </span>
            {props.title}
          </summary>
          {props.children}
        </details>
      </section>
    );
  }

  return (
    <section class="mt-5">
      <h2 class="m-0 mb-2.5 text-base font-medium text-ink">{props.title}</h2>
      {props.children}
    </section>
  );
}

export default DashboardSection;
