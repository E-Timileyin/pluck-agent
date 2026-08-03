import type { PropsWithChildren } from 'hono/jsx';
import './AuthSplit.css';

/**
 * The entry screen stands apart from the training flow: no progress rail, no
 * topbar — a full-bleed brand panel and the form. Drop a photo at
 * public/auth-panel.jpg and it takes over the panel background automatically.
 */
export function AuthSplit({ children }: PropsWithChildren) {
  return (
    <div class="authsplit">
      <aside class="authsplit-panel">
        <img class="authsplit-logo" src="/logo.png" alt="Pluck" />
        <p class="authsplit-tagline">
          Everything a Pluck promoter needs to know about commission, credit checks and conduct
          in about fifteen minutes.
        </p>
      </aside>

      <section class="authsplit-form">
        <div class="authsplit-inner">{children}</div>
      </section>
    </div>
  );
}

export default AuthSplit;
