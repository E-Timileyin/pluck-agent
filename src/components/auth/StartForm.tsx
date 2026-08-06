import { AUTH_INPUT } from './AuthLayout';
import { AuthField } from './AuthField';
import { AuthSubmit } from './AuthSubmit';

export type StartValues = { name?: string; phone?: string; tier?: string; email?: string };

/** Phone is the identifier, not email — see flow.md §1. */
export function StartForm(props: { values?: StartValues; errors?: Record<string, string> }) {
  const values = props.values ?? {};
  const errors = props.errors ?? {};

  return (
    <form method="post" action="/start" class="grid gap-4">
      <AuthField label="Full name" error={errors.name}>
        <input
          class={AUTH_INPUT}
          name="name"
          type="text"
          autocomplete="name"
          maxlength={80}
          placeholder="Emeka Okafor"
          required
          value={values.name ?? ''}
        />
      </AuthField>

      <AuthField label="Phone number" error={errors.phone}>
        {/* The +234 is a label, not a prefix that gets concatenated —
            normalizePhone() takes 080…, 80…, 234… or +234… all the same. */}
        <span class="flex items-stretch overflow-hidden rounded-xl border border-line bg-surface focus-within:border-brand focus-within:bg-white">
          <span class="flex shrink-0 items-center gap-2 border-r border-line px-3.5 text-[15px] font-semibold text-ink">
            <svg class="h-4 w-6 rounded-sm border border-line" viewBox="0 0 9 6" aria-hidden="true">
              <rect width="3" height="6" fill="#008751" />
              <rect x="3" width="3" height="6" fill="#ffffff" />
              <rect x="6" width="3" height="6" fill="#008751" />
            </svg>
            +234
          </span>
          <input
            class="h-13 min-w-0 flex-1 border-0 bg-transparent px-3.5 text-[15px] text-ink outline-none placeholder:text-muted"
            name="phone"
            type="tel"
            inputmode="tel"
            autocomplete="tel"
            placeholder="08012345678"
            required
            value={values.phone ?? ''}
          />
        </span>
      </AuthField>

      <AuthField label="Email" optional error={errors.email}>
        <input
          class={AUTH_INPUT}
          name="email"
          type="email"
          autocomplete="email"
          placeholder="you@example.com"
          value={values.email ?? ''}
        />
      </AuthField>

      {/* Every new sales agent starts on SP3 — there is no other course yet, so
          this is a fixed fact rather than a question. Still posted, so the
          server keeps validating it instead of trusting a default. */}
      <input type="hidden" name="tier" value="SP3" />
      <p class="m-0 rounded-xl bg-brand-mint px-4 py-3 text-[13px]/[1.5] text-brand-ink">
        You will be enrolled on the <strong>SP3</strong> training. Your supervisor moves you up a
        tier once you have passed it.
      </p>

      <AuthSubmit>Start training</AuthSubmit>
    </form>
  );
}

export default StartForm;
