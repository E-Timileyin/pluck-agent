import type { Child, FC, PropsWithChildren } from 'hono/jsx';
import { raw } from 'hono/html';
import { StepRail } from './StepRail';
import { AdminNav } from './AdminNav';
import type { Step } from '../../lib/progress';
import './Layout.css';

type LayoutProps = PropsWithChildren<{
  title: string;
  /**
   * Training screens only. Comes from `attemptProgress()`, so the rail on a
   * training screen and the one on the dashboard can never disagree.
   */
  steps?: Step[];
  /** `auth` is the entry screen — full-bleed, no chrome, no rail. */
  variant?: 'agent' | 'admin' | 'auth' | 'dashboard';
  /** Loads /app.js — the countdown, and nothing else. */
  script?: boolean;
  /** Fixed to the bottom of the viewport, outside `main`. Dashboard only. */
  bottomNav?: Child;
}>;

export function Layout({ title, steps, variant = 'agent', script, bottomNav, children }: LayoutProps) {
  const chrome = variant !== 'auth';

  return (
    <>
      {raw('<!DOCTYPE html>')}
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="color-scheme" content="light" />
          <title>{title} — Pluck Sales Promoter Training</title>
          <link rel="icon" href="/logo.png" />
          <link rel="stylesheet" href="/styles.css" />
        </head>
        <body class={variant}>
          {/* The dashboard has no green bar at all — DashboardBar carries the
              brand on a phone and the sidebar carries it from lg up. */}
          {chrome && variant !== 'dashboard' ? (
            <header class="topbar">
              <a class="brand" href={variant === 'admin' ? '/admin' : '/'}>
                {/* White-on-transparent logo, so it sits on the Deep green bar. */}
                <img class="brand-logo" src="/logo.png" alt="Pluck" />
                <span class="brand-sub">Sales Promoter Training</span>
              </a>
              {variant === 'admin' ? <AdminNav /> : null}
            </header>
          ) : null}
          {variant === 'agent' && steps ? (
            <div class="railbar">
              <StepRail steps={steps} />
            </div>
          ) : null}

          {variant === 'auth' ? (
            children
          ) : (
            /* The dashboard shell sizes its own columns; all this adds is
               clearance for the fixed tab bar on a phone. */
            <main class={variant === 'dashboard' ? 'pb-24 lg:pb-0' : 'shell'}>{children}</main>
          )}

          {/* The dashboard's footer slot belongs to the tab bar. */}
          {chrome && variant !== 'dashboard' ? (
            <footer class="foot">Pluck · internal training</footer>
          ) : null}
          {bottomNav ?? null}
          {script ? <script src="/app.js" defer></script> : null}
        </body>
      </html>
    </>
  );
}

export default Layout as FC<LayoutProps>;
