import type { Child } from "hono/jsx";

export function PageHeader(props: {
  title: string;
  sub?: string;
  actions?: Child;
}) {
  return (
    <div class="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div class="min-w-0">
        <h1 class="m-0 text-[26px] leading-tight font-semibold tracking-tight text-ink lg:text-2xl">
          {props.title}
        </h1>
        {props.sub ? (
          <p class="m-0 mt-1.5 text-[15px] text-muted lg:mt-0.5 lg:text-sm">
            {props.sub}
          </p>
        ) : null}
      </div>
      {props.actions ? (
        <div class="flex w-full flex-wrap gap-2 sm:w-auto sm:shrink-0">{props.actions}</div>
      ) : null}
    </div>
  );
}

export default PageHeader;
