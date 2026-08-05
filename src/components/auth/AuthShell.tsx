import type { PropsWithChildren } from 'hono/jsx';
import { AuthPanel } from './AuthPanel';
import './AuthShell.css';

/**
 * One centred column on a phone; a two-column split from 62rem up, where the
 * brand panel on the left has room to earn its place. The panel is markup in
 * both cases and simply hides on small screens — no duplicate render path.
 *
 * Both layouts are sized to fit the viewport without scrolling; the CSS drops
 * the selling points first when the screen is too short for everything.
 */
export function AuthShell({ children }: PropsWithChildren) {
  return (
    <div class="authshell">
      <AuthPanel />

      <section class="authshell-main">
        <div class="authshell-glow" aria-hidden="true"></div>

        <div class="authshell-inner">
          <div class="authshell-brand">
            <img class="authshell-logo" src="/logo-dark.png" alt="Pluck" />
          </div>

          {children}

          <p class="authshell-foot">
            © {new Date().getUTCFullYear()} Pluck. All rights reserved.
          </p>
        </div>
      </section>
    </div>
  );
}

export default AuthShell;
