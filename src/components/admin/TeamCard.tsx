import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Field, INPUT } from '../common/Field';
import { StatusPill } from '../common/StatusPill';
import type { Admin } from '../../db/schema';
import { formatDate } from '../../lib/format';

/**
 * Who can sign in to the console, and the form that adds one more.
 *
 * There is no delete: an account that has signed in is part of the record of
 * who changed what, the same reason questions are deactivated rather than
 * dropped. Removing accounts is the next piece of work, not a missing button.
 */
export function TeamCard(props: {
  admins: Admin[];
  currentId: string;
  values?: { name?: string; email?: string };
  errors?: Record<string, string>;
}) {
  const errors = props.errors ?? {};

  return (
    <Card
      title="Team"
      sub="Everyone who can sign in to this console. Each account is named, so every sign-in has somebody behind it."
    >
      <ul class="m-0 grid list-none gap-2 p-0">
        {props.admins.map((admin) => (
          <li class="flex flex-wrap items-center gap-3 rounded-xl border border-line px-4 py-3">
            <span
              class="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-deep text-sm font-semibold text-white"
              aria-hidden="true"
            >
              {admin.name.slice(0, 1).toUpperCase()}
            </span>

            <span class="min-w-0 flex-1">
              <span class="block truncate text-[15px] font-semibold text-ink">
                {admin.name}
                {admin.id === props.currentId ? (
                  <span class="ml-2 align-middle">
                    <StatusPill tone="pass">You</StatusPill>
                  </span>
                ) : null}
              </span>
              <span class="block truncate text-[13px] text-muted">{admin.email}</span>
            </span>

            <span class="shrink-0 text-[13px] text-muted">
              {admin.lastLoginAt ? `Last in ${formatDate(admin.lastLoginAt)}` : 'Never signed in'}
            </span>
          </li>
        ))}
      </ul>

      <form method="post" action="/admin/team" class="mt-5 grid gap-4 border-t border-line pt-5">
        <p class="m-0 text-[15px] font-semibold text-ink">Add an admin</p>

        <div class="grid gap-4 sm:grid-cols-2">
          <Field label="Name" error={errors.name}>
            <input
              class={INPUT}
              name="name"
              type="text"
              maxlength={80}
              required
              value={props.values?.name ?? ''}
            />
          </Field>

          <Field label="Email" error={errors.email}>
            <input
              class={INPUT}
              name="email"
              type="email"
              required
              value={props.values?.email ?? ''}
            />
          </Field>
        </div>

        <Field
          label="Temporary password"
          hint="At least 10 characters. Send it to them out of band — there is no password reset yet, so they keep it until someone builds one."
          error={errors.password}
        >
          <input class={INPUT} name="password" type="password" autocomplete="new-password" required />
        </Field>

        <div>
          <Button type="submit" tone="ghost">
            Add admin
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default TeamCard;
