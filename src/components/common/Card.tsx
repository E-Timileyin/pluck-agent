import type { Child } from 'hono/jsx';
import type { IconType } from 'react-icons';

/**
 * The white panel every shell screen is built from: 16px radius, one hairline
 * border, no shadow. Titled or bare — a bare card is just the surface.
 */
export function Card(props: {
  title?: string;
  /** The round chip beside the title — the same one the dashboard tiles use. */
  Icon?: IconType;
  sub?: string;
  /** Sits opposite the title — a count, a link, a small action. */
  aside?: Child;
  tone?: 'plain' | 'tint';
  class?: string;
  children?: Child;
}) {
  const surface =
    props.tone === 'tint' ? 'bg-brand-tint' : 'border border-line bg-white';

  return (
    <section class={`rounded-2xl p-4 lg:p-5 ${surface} ${props.class ?? ''}`}>
      {props.title ? (
        <div class="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div class="flex min-w-0 items-start gap-3">
            {props.Icon ? (
              <span
                class="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-mint text-brand-deep"
                aria-hidden="true"
              >
                <props.Icon size={18} />
              </span>
            ) : null}
            <div class="min-w-0">
              <h2 class="m-0 text-base font-semibold text-ink">{props.title}</h2>
              {props.sub ? <p class="m-0 mt-1 text-[13px]/[1.5] text-muted">{props.sub}</p> : null}
            </div>
          </div>
          {props.aside ? <div class="shrink-0">{props.aside}</div> : null}
        </div>
      ) : null}
      {props.children}
    </section>
  );
}

export default Card;
