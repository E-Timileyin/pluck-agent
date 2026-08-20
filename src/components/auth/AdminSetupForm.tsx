import { AUTH_INPUT } from "./AuthLayout";
import { AuthField } from "./AuthField";
import { AuthSubmit } from "./AuthSubmit";
import { AuthError } from "./AuthError";

export function AdminSetupForm(props: {
  values?: { name?: string; email?: string };
  errors?: Record<string, string>;
  error?: string;
}) {
  const errors = props.errors ?? {};

  return (
    <>
      <AuthError message={props.error} />

      <form method="post" action="/admin/setup" class="grid gap-4">
        <AuthField label="Your name" error={errors.name}>
          <input
            class={AUTH_INPUT}
            name="name"
            type="text"
            autocomplete="name"
            maxlength={80}
            required
            autofocus
            value={props.values?.name ?? ""}
          />
        </AuthField>

        <AuthField label="Email" error={errors.email}>
          <input
            class={AUTH_INPUT}
            name="email"
            type="email"
            autocomplete="username"
            inputmode="email"
            placeholder="you@pluck.ng"
            required
            value={props.values?.email ?? ""}
          />
        </AuthField>

        <div class="grid gap-4 sm:grid-cols-2">
          <AuthField label="Password" error={errors.password}>
            <input
              class={AUTH_INPUT}
              name="password"
              type="password"
              autocomplete="new-password"
              required
            />
          </AuthField>

          <AuthField label="Confirm" error={errors.confirm}>
            <input
              class={AUTH_INPUT}
              name="confirm"
              type="password"
              autocomplete="new-password"
              required
            />
          </AuthField>
        </div>

        <AuthField
          label="Setup key"
          hint="The ADMIN_PASSCODE this worker was deployed with. At least 10 characters for the password."
          error={errors.setupKey}
        >
          <input class={AUTH_INPUT} name="setupKey" type="password" required />
        </AuthField>

        <AuthSubmit>Create admin account</AuthSubmit>
      </form>
    </>
  );
}

export default AdminSetupForm;
