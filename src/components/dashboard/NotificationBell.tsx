import { FiBell } from 'react-icons/fi';

/** The count is a constant — there is no notification system behind it. */
export function NotificationBell(props: { count?: number }) {
  const count = props.count ?? 0;

  return (
    <span class="relative inline-flex" aria-hidden="true">
      <span class="flex size-11 items-center justify-center rounded-full border border-line bg-white text-muted">
        <FiBell size={20} />
      </span>
      {count > 0 ? (
        <span class="absolute -top-1 -right-1 flex size-[18px] items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white">
          {count}
        </span>
      ) : null}
    </span>
  );
}

export default NotificationBell;
