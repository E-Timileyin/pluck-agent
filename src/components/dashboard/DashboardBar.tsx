import { NotificationBell } from './NotificationBell';

/**
 * Phone-only top row. From lg the sidebar carries the logo and the bell moves
 * to the top-right of the content area.
 */
export function DashboardBar(props: { count?: number }) {
  return (
    <div class="mb-6 flex items-center justify-between gap-4 lg:hidden">
      <img class="h-8 w-auto" src="/logo-dark.png" alt="Pluck" />
      <NotificationBell count={props.count} />
    </div>
  );
}

export default DashboardBar;
