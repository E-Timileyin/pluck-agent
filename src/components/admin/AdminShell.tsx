import type { Child } from 'hono/jsx';
import { Layout } from '../common/Layout';
import { PageHeader } from '../common/PageHeader';
import { FiExternalLink, FiLogOut } from 'react-icons/fi';
import { AdminRail } from './AdminRail';
import { TopNav } from '../common/TopNav';
import { ADMIN_TABS, type AdminNavKey } from './adminTabs';
import type { Admin } from '../../db/schema';

export type { AdminNavKey };

/**
 * The chrome every console screen sits inside: a floating icon capsule centred
 * on the left edge, a sticky bar across the top, then one wide content column.
 *
 * Both carry the same four destinations on purpose. The capsule is reachable
 * without moving your eyes from the middle of the screen; the bar spells the
 * sections out in words and holds the account and the two controls that are not
 * sections. On a phone the capsule stays put and the bar's pills scroll.
 *
 * The agent app keeps its labelled sidebar instead — it is used one-handed by
 * people meeting the app once, where a wordless icon is a guess.
 */
export function AdminShell(props: {
  title: string;
  active: AdminNavKey;
  /** Who is signed in — the top bar names them, so no screen is anonymous. */
  admin: Admin;
  heading?: string;
  sub?: string;
  /** Sits on the header's right — filters, "add" buttons and the like. */
  actions?: Child;
  /** Lets the dashboard lay out its own full-width bento grid. */
  bare?: boolean;
  children?: Child;
}) {
  return (
    <Layout title={props.title} variant="admin">
      <AdminRail active={props.active} />

      <div class="pl-[72px]">
        <TopNav
          tabs={ADMIN_TABS}
          active={props.active}
          name={props.admin.name}
          sub={props.admin.email}
          homeHref="/admin"
          actions={
            <>
              {/* Neither of these is a section, which is why they are here and
                  not in the rail. */}
              <a
                class="flex size-10 items-center justify-center rounded-full border border-line bg-white text-muted no-underline transition-colors duration-150 hover:text-brand"
                href="/dashboard"
                title="Sales agent view"
              >
                <FiExternalLink size={18} />
                <span class="sr-only">Sales agent view</span>
              </a>

              <form method="post" action="/admin/logout" class="flex">
                <button
                  class="flex size-10 cursor-pointer items-center justify-center rounded-full border border-line bg-white text-muted transition-colors duration-150 hover:text-miss"
                  type="submit"
                  title="Sign out"
                >
                  <FiLogOut size={18} />
                  <span class="sr-only">Sign out</span>
                </button>
              </form>
            </>
          }
        />

        <div class="mx-auto w-full max-w-[1400px] px-4 py-5 lg:px-6 lg:py-6">
          {props.bare ? null : (
            <PageHeader title={props.heading ?? props.title} sub={props.sub} actions={props.actions} />
          )}

          {props.children}

          <p class="mt-8 flex justify-between gap-4 border-t border-line pt-3 text-[13px] text-muted">
            <span>© {new Date().getUTCFullYear()} Pluck. All rights reserved.</span>
            <span>Training console</span>
          </p>
        </div>
      </div>
    </Layout>
  );
}

export default AdminShell;
