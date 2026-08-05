import type { Child } from 'hono/jsx';
import { Layout } from './Layout';
import { StepRail } from './StepRail';
import { BottomNav, type NavKey } from '../dashboard/BottomNav';
import { SideNav } from '../dashboard/SideNav';
import { DashboardBar } from '../dashboard/DashboardBar';
import { NotificationBell } from '../dashboard/NotificationBell';
import type { Shell } from '../../lib/shell';

/**
 * The chrome every promoter screen sits inside: a fixed, flush, full-height
 * sidebar on desktop and a tab bar on a phone. Training, quiz, attestation and
 * results are pages *within* this shell, not separate documents with their own
 * navigation.
 *
 * Widths come straight from the comp: 264 sidebar, 760 main, 296 rail, 24 gap.
 */
export function PromoterShell(props: {
  title: string;
  shell: Shell;
  active: NavKey;
  /** Renders the step rail above the content. The dashboard omits it — its
   *  progress card already draws the same rail. */
  showRail?: boolean;
  /** Desktop right column. Falls below the content on a phone. */
  rail?: Child;
  /** Sits in a row with the bell, above both columns. */
  header?: Child;
  script?: boolean;
  children?: Child;
}) {
  const { shell } = props;

  const hrefs: Partial<Record<NavKey, string>> = {
    dashboard: '/dashboard',
    training: '/learn',
    results: shell.resultsHref,
  };

  return (
    <Layout
      title={props.title}
      variant="dashboard"
      script={props.script}
      bottomNav={<BottomNav active={props.active} hrefs={hrefs} />}
    >
      <SideNav
        active={props.active}
        hrefs={hrefs}
        name={shell.promoter.name}
        tier={shell.promoter.tier}
        percent={shell.progress.percent}
      />

      <div class="lg:pl-[300px]">
        <div class="relative mx-auto w-full max-w-[1144px] px-4 py-6 lg:px-8 lg:py-8">
          <DashboardBar count={3} />

          {/* The bell rides with the greeting rather than floating, which is
              what keeps the rail's first card level with the main column's. */}
          <div class="flex items-start justify-between gap-6">
            <div class="min-w-0">{props.header ?? null}</div>
            <div class="hidden shrink-0 lg:block">
              <NotificationBell count={3} />
            </div>
          </div>

          <div class="flex flex-col gap-6 lg:flex-row lg:items-start">
            <main class="min-w-0 flex-1 lg:max-w-[760px]">
              {props.showRail ? (
                <div class="mb-6 rounded-2xl border border-line bg-white p-6">
                  <StepRail steps={shell.progress.steps} />
                </div>
              ) : null}

              {props.children}
            </main>

            {props.rail ? <div class="w-full shrink-0 lg:w-[296px]">{props.rail}</div> : null}
          </div>

          <p class="mt-10 flex justify-between gap-4 border-t border-line pt-4 text-[13px] text-muted">
            <span>© {new Date().getUTCFullYear()} Pluck. All rights reserved.</span>
            <span>Version 1.0.0</span>
          </p>
        </div>
      </div>
    </Layout>
  );
}

export default PromoterShell;
