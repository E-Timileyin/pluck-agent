import type { FC, PropsWithChildren } from 'hono/jsx';
import { raw } from 'hono/html';
import { StepRail } from './StepRail';
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
}>;

export function Layout({ title, steps, variant = 'agent', script, children }: LayoutProps) {
  const chrome = variant !== 'auth';
  /* PromoterShell and AdminShell draw their own sidebar, header and footer, so
     the document-level chrome below belongs to the `agent` screens alone. */
  const ownsChrome = variant === 'dashboard' || variant === 'admin';

  return (
    <>
      {raw('<!DOCTYPE html>')}
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="color-scheme" content="light" />
          <title>{title} — Pluck Sales Agent Training</title>
          <link rel="icon" href="/favicon.ico" />

          {/* DM Sans, variable. Preconnected because these screens are read on
              Nigerian mobile data, where a second round trip is felt. The stack
              in App.css falls back to the system font if it never arrives. */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,100..1000;1,100..1000&display=swap"
          />

          <link rel="stylesheet" href="/styles.css" />
        </head>
        <body class={variant}>
          {/* Neither shell has a green bar at all — their own top row carries
              the brand on a phone and their sidebar carries it from lg up. */}
          {chrome && !ownsChrome ? (
            <header class="topbar">
              <a class="brand" href="/">
                {/* White-on-transparent logo, so it sits on the Deep green bar. */}
                <img class="brand-logo" src="/logo.png" alt="Pluck" />
                <span class="brand-sub">Sales Agent Training</span>
              </a>
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
            /* Both shells size their own columns and bring their own bars. */
            <main class={ownsChrome ? '' : 'shell'}>{children}</main>
          )}

          {/* A shell's footer slot belongs to its tab bar. */}
          {chrome && !ownsChrome ? <footer class="foot">Pluck · internal training</footer> : null}
          {script ? <script src="/app.js" defer></script> : null}
        </body>
      </html>
    </>
  );
}

export default Layout as FC<LayoutProps>;
