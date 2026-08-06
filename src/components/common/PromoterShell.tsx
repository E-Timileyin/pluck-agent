import type { Child } from 'hono/jsx';
import { Layout } from './Layout';
import { Panel } from './Panel';
import { StepRail } from './StepRail';
import { SideNav } from '../dashboard/SideNav';
import { MobileBar } from '../dashboard/MobileBar';
import { type NavKey } from '../dashboard/agentTabs';
import { NotificationBell } from '../dashboard/NotificationBell';
import type { Shell } from '../../lib/shell';

/**
 * The chrome every sales-agent screen sits inside: a fixed, flush, full-height
 * sidebar on desktop, and a sticky top bar with a hamburger on a phone.
 * Training, quiz, attestation and results are pages *within* this shell, not
 * separate documents with their own navigation.
 */
export function PromoterShell(props: {
  title: string;
  shell: Shell;
  active: NavKey;
  /** Renders the step rail above the content. The dashboard omits it — its
   *  progress tile already draws the same rail. */
  showRail?: boolean;
  /** Desktop right column. Falls below the content on a phone. */
  rail?: Child;
  /** Sits in a row with the bell, above both columns. */
  header?: Child;
  /** Lets the dashboard lay out its own full-width bento grid. */
  wide?: boolean;
  script?: boolean;
  children?: Child;
}) {
  const { shell } = props;

  return (
    <Layout title={props.title} variant="dashboard" script={props.script}>
      <SideNav
        active={props.active}
        name={shell.promoter.name}
        tier={shell.promoter.tier}
        percent={shell.progress.percent}
        photoHref={shell.photoHref}
      />

      <div class="lg:pl-[300px]">
        <div
          class={`relative mx-auto w-full px-4 py-5 lg:px-6 lg:py-6 ${
            props.wide ? 'max-w-[1400px]' : 'max-w-[1144px]'
          }`}
        >
          <MobileBar
            active={props.active}
            notices={shell.notices}
            name={shell.promoter.name}
            tier={shell.promoter.tier}
            photoHref={shell.photoHref}
          />

          {/* The bell rides with the greeting rather than floating, which is
              what keeps the rail's first card level with the main column's. */}
          <div class="flex items-start justify-between gap-6">
            <div class="min-w-0">{props.header ?? null}</div>
            <div class="hidden shrink-0 lg:block">
              <NotificationBell notices={shell.notices} />
            </div>
          </div>

          <div class="flex flex-col gap-3 lg:flex-row lg:items-start">
            <main class={`min-w-0 flex-1 ${props.wide ? '' : 'lg:max-w-[760px]'}`}>
              {props.showRail ? (
                <Panel class="mb-3">
                  <StepRail steps={shell.progress.steps} />
                </Panel>
              ) : null}

              {props.children}
            </main>

            {props.rail ? <div class="w-full shrink-0 lg:w-[300px]">{props.rail}</div> : null}
          </div>

          <p class="mt-8 flex justify-between gap-4 border-t border-line pt-3 text-[13px] text-muted">
            <span>© {new Date().getUTCFullYear()} Pluck. All rights reserved.</span>
            <span>Version 1.0.0</span>
          </p>
        </div>
      </div>
    </Layout>
  );
}

export default PromoterShell;
