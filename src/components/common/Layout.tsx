import type { FC, PropsWithChildren } from 'hono/jsx';
import { raw } from 'hono/html';
import { ProgressRail, type Step } from './ProgressRail';
import { AdminNav } from './AdminNav';
import './Layout.css';

type LayoutProps = PropsWithChildren<{
  title: string;
  /** Training screens only: highlights the current step in the rail. */
  step?: Step;
  /** `auth` is the entry screen — full-bleed, no chrome, no rail. */
  variant?: 'agent' | 'admin' | 'auth';
  /** Loads /app.js — the countdown, and nothing else. */
  script?: boolean;
}>;

export function Layout({ title, step, variant = 'agent', script, children }: LayoutProps) {
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
          {chrome ? (
            <header class="topbar">
              <a class="brand" href={variant === 'admin' ? '/admin' : '/'}>
                {/* White-on-transparent logo, so it sits on the Deep green bar. */}
                <img class="brand-logo" src="/logo.png" alt="Pluck" />
                <span class="brand-sub">Sales Promoter Training</span>
              </a>
              {variant === 'admin' ? <AdminNav /> : null}
            </header>
          ) : null}
          {variant === 'agent' ? <ProgressRail step={step} /> : null}

          {variant === 'auth' ? children : <main class="shell">{children}</main>}

          {chrome ? <footer class="foot">Pluck · internal training</footer> : null}
          {script ? <script src="/app.js" defer></script> : null}
        </body>
      </html>
    </>
  );
}

export default Layout as FC<LayoutProps>;
