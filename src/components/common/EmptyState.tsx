import type { IconType } from 'react-icons';

/**
 * What a screen says when there is genuinely nothing to show. Always names the
 * one action that fills it — an empty table with no next step reads as broken.
 */
export function EmptyState(props: {
  Icon: IconType;
  title: string;
  copy: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div class="rounded-2xl border border-dashed border-line bg-white px-6 py-9 text-center">
      <span
        class="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-brand-mint text-brand-deep"
        aria-hidden="true"
      >
        <props.Icon size={22} />
      </span>
      <p class="m-0 mb-1 text-base font-semibold text-ink">{props.title}</p>
      <p class="m-0 mx-auto max-w-[46ch] text-[15px]/[1.6] text-muted">{props.copy}</p>

      {props.actionHref && props.actionLabel ? (
        <a
          class="mt-5 inline-flex min-h-12 items-center rounded-xl bg-brand px-6 text-[15px] font-semibold text-white no-underline"
          href={props.actionHref}
        >
          {props.actionLabel}
        </a>
      ) : null}
    </div>
  );
}

export default EmptyState;
