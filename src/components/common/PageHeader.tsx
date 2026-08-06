import type { Child } from 'hono/jsx';

/**
 * The title block every shell screen opens with. Shared by the promoter pages
 * and the admin console so the two never drift apart — the dashboard is the one
 * exception, because its greeting carries an emoji and its own type scale.
 */
export function PageHeader(props: { title: string; sub?: string; actions?: Child }) {
  return (
    <div class="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div class="min-w-0">
        <h1 class="m-0 text-xl font-bold tracking-tight text-ink lg:text-2xl">
          {props.title}
        </h1>
        {props.sub ? <p class="m-0 mt-0.5 text-sm text-muted">{props.sub}</p> : null}
      </div>
      {props.actions ? <div class="flex shrink-0 gap-2">{props.actions}</div> : null}
    </div>
  );
}

export default PageHeader;
