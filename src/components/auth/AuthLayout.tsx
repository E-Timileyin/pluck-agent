import type { Child } from 'hono/jsx';
import type { IconType } from 'react-icons';
import { Layout } from '../common/Layout';

export type AuthFeature = { Icon: IconType; title: string; copy: string };

/**
 * Every sign-in screen: a brand panel filling the left half from lg up, and a
 * white card carrying the form on the right. On a phone the panel is not
 * rendered and the card is the whole screen.
 *
 * `art` swaps the panel for the artwork, full bleed and uncompressed.
 *
 * It is applied as a CSS background inside an `lg:` variant rather than as an
 * `<img>`: the panel is not rendered below lg, but an `<img>` inside a hidden
 * element is still fetched, and a phone on Nigerian mobile data should not pay
 * for a 1.8 MB poster it never sees.
 */
export const AUTH_INPUT =
  'h-13 w-full rounded-xl border border-line bg-surface px-4 text-[15px] text-ink placeholder:text-muted focus:border-brand focus:bg-white';

export function AuthLayout(props: {
  /** The document title, not the heading. */
  title: string;
  heading: string;
  sub?: string;
  panelTitle: string;
  panelCopy: string;
  features: AuthFeature[];
  /** A poster for the left panel. Replaces the gradient and the copy. */
  art?: string;
  /** The line under the card — "Have an account? Log in". */
  footer?: Child;
  children?: Child;
}) {
  return (
    <Layout title={props.title} variant="auth">
      <div class="flex min-h-screen bg-page p-0 lg:p-3">
        {/* ---- brand panel ---- */}
        {props.art ? (
          <aside
            class="hidden w-1/2 shrink-0 rounded-3xl bg-[#e4f0e6] bg-cover bg-top bg-no-repeat lg:block"
            style={`background-image:url('${props.art}')`}
            aria-hidden="true"
          ></aside>
        ) : (
          <aside class="relative hidden w-1/2 shrink-0 overflow-hidden rounded-3xl bg-[linear-gradient(155deg,#dbffe5_0%,#8fdfab_45%,#045023_100%)] p-10 lg:flex lg:flex-col">
            <img class="h-11 w-auto self-start" src="/logo-dark.png" alt="Pluck" />

            <div class="mt-auto">
              <h2 class="m-0 max-w-[16ch] text-[38px] leading-[1.1] font-semibold tracking-tight text-white">
                {props.panelTitle}
              </h2>
              <p class="m-0 mt-3 max-w-[46ch] text-[15px]/[1.6] text-white/85">{props.panelCopy}</p>

              <ul class="m-0 mt-8 grid list-none gap-2.5 p-0">
                {props.features.map(({ Icon, title, copy }) => (
                  <li class="flex items-center gap-3 rounded-2xl bg-white/15 p-3 backdrop-blur">
                    <span
                      class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-deep"
                      aria-hidden="true"
                    >
                      <Icon size={18} />
                    </span>
                    <span class="min-w-0">
                      <span class="block text-sm font-medium text-white">{title}</span>
                      <span class="block text-[13px] text-white/75">{copy}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <p class="m-0 mt-8 text-[13px] text-white/70">
              © {new Date().getUTCFullYear()} Pluck. All rights reserved.
            </p>
          </aside>
        )}

        {/* ---- form ---- */}
        <main class="flex min-w-0 flex-1 items-center justify-center px-4 py-8 lg:px-8">
          <div class="w-full max-w-[26rem]">
            {/* Phone only — from lg the panel carries the wordmark. */}
            <img class="mx-auto mb-8 h-9 w-auto lg:hidden" src="/logo-dark.png" alt="Pluck" />

            <h1 class="m-0 text-center text-[34px] leading-[1.15] font-semibold tracking-tight text-ink lg:text-[40px]">
              {props.heading}
            </h1>
            {props.sub ? (
              <p class="m-0 mt-2.5 text-center text-[15px]/[1.5] text-muted">{props.sub}</p>
            ) : null}

            <div class="mt-7">{props.children}</div>

            {props.footer ? (
              <p class="m-0 mt-7 text-center text-sm text-muted">{props.footer}</p>
            ) : null}
          </div>
        </main>
      </div>
    </Layout>
  );
}

export default AuthLayout;
