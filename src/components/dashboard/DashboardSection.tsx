import type { Child } from 'hono/jsx';

/**
 * Heading plus its block. Exists so the page stays a composition root — a bare
 * <h2> in DashboardPage would be the first crack in that rule.
 */
export function DashboardSection(props: { title: string; children?: Child }) {
  return (
    <section class="mt-4">
      <h2 class="m-0 mb-3 text-lg font-semibold text-ink">{props.title}</h2>
      {props.children}
    </section>
  );
}

export default DashboardSection;
