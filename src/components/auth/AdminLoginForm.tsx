import { AUTH_INPUT } from './AuthLayout';
import { AuthField } from './AuthField';
import { AuthSubmit } from './AuthSubmit';
import { AuthError } from './AuthError';

/**
 * Named accounts, not a shared passcode — the session that comes out of this
 * knows who signed in, which is what puts a name on `admins.last_login_at`.
 *
 * The failure message never says whether it was the email or the password that
 * was wrong; that difference is how you enumerate accounts.
 */
export function AdminLoginForm(props: {
  values?: { email?: string };
  errors?: Record<string, string>;
  error?: string;
}) {
  const errors = props.errors ?? {};

  return (
    <>
      <AuthError message={props.error} />

      <form method="post" action="/admin/login" class="grid gap-4">
        <AuthField label="Email" error={errors.email}>
          <input
            class={AUTH_INPUT}
            name="email"
            type="email"
            autocomplete="username"
            inputmode="email"
            placeholder="you@pluck.ng"
            required
            autofocus
            value={props.values?.email ?? ''}
          />
        </AuthField>

        <AuthField label="Password" error={errors.password}>
          <input
            class={AUTH_INPUT}
            name="password"
            type="password"
            autocomplete="current-password"
            placeholder="••••••••••"
            required
          />
        </AuthField>

        <AuthSubmit>Sign in</AuthSubmit>
      </form>
    </>
  );
}

export default AdminLoginForm;
