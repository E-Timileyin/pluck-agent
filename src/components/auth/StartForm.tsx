import { AUTH_INPUT } from "./AuthLayout";
import { AuthField } from "./AuthField";
import { AuthSubmit } from "./AuthSubmit";
import { AuthError } from "./AuthError";

export type StartValues = {
  agentId?: string;
  phone?: string;
  email?: string;
};

/**
 * Sign-in, not self-registration: Sales Agent ID + phone + email must match a
 * roster row an admin imported from the main app — see docs/flow.md §1. The
 * failure message never says which of the three didn't match; that is how you
 * enumerate valid agent IDs.
 */
export function StartForm(props: {
  values?: StartValues;
  errors?: Record<string, string>;
  error?: string;
}) {
  const values = props.values ?? {};
  const errors = props.errors ?? {};

  return (
    <>
      <AuthError message={props.error} />

      <form method="post" action="/start" class="grid gap-4">
        <AuthField label="Sales Agent ID" error={errors.agentId}>
          <input
            class={AUTH_INPUT}
            name="agentId"
            type="text"
            autocomplete="username"
            maxlength={40}
            placeholder="e.g. SAG392585"
            required
            value={values.agentId ?? ""}
          />
        </AuthField>

        <AuthField label="Phone number" error={errors.phone}>
          {/* The +234 is a label, not a prefix that gets concatenated —
              normalizePhone() takes 080…, 80…, 234… or +234… all the same. */}
          <span class="flex items-stretch overflow-hidden rounded-xl border border-line bg-surface focus-within:border-brand focus-within:bg-white">
            <span class="flex shrink-0 items-center gap-2 border-r border-line px-3.5 text-[15px] font-medium text-ink">
              <svg
                class="h-4 w-6 rounded-sm border border-line"
                viewBox="0 0 9 6"
                aria-hidden="true"
              >
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
              placeholder="Enter Your Phone Number"
              required
              value={values.phone ?? ""}
            />
          </span>
        </AuthField>

        <AuthField label="Email" error={errors.email}>
          <input
            class={AUTH_INPUT}
            name="email"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
            required
            value={values.email ?? ""}
          />
        </AuthField>

        <AuthSubmit>Start training</AuthSubmit>
      </form>
    </>
  );
}

export default StartForm;
