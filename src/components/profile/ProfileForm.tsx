import { FiLock } from "react-icons/fi";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { Field, INPUT } from "../common/Field";
import type { Promoter } from "../../db/schema";
import { formatPhone } from "../../lib/phone";

/**
 * Name and email are the sales agent's to correct.
 *
 * The phone number is not: it is the identity column every attempt hangs off,
 * and changing it here would quietly mean "become somebody else". Neither is
 * the tier: it is what the training certifies, so moving yourself up would make
 * the certificate worthless. Both are shown, locked, with the reason — an
 * absent field reads as an oversight, a locked one reads as a decision.
 */
export function ProfileForm(props: {
  promoter: Promoter;
  values?: { name?: string; email?: string };
  errors?: Record<string, string>;
}) {
  const { promoter } = props;
  const values = props.values ?? {};
  const errors = props.errors ?? {};

  const locked = `${INPUT} flex items-center justify-between gap-3 bg-brand-tint`;

  return (
    <Card
      title="Your details"
      sub="Correct anything that is wrong it appears on your result."
    >
      <form method="post" action="/profile" class="grid gap-5">
        <Field
          label="Sales Agent ID"
          hint="Assigned by your supervisor's app — not yours to change here."
        >
          <span class={locked}>
            {promoter.agentId}
            <span class="shrink-0 text-muted" aria-hidden="true">
              <FiLock size={16} />
            </span>
          </span>
        </Field>

        <Field label="Full name" error={errors.name}>
          <input
            class={INPUT}
            name="name"
            type="text"
            autocomplete="name"
            maxlength={80}
            required
            value={values.name ?? promoter.name}
          />
        </Field>

        <Field
          label="Phone number"
          hint="Your phone number identifies you across every attempt, so it cannot be changed here. Ask your supervisor if it is wrong."
        >
          <span class={locked}>
            {formatPhone(promoter.phone)}
            <span class="shrink-0 text-muted" aria-hidden="true">
              <FiLock size={16} />
            </span>
          </span>
        </Field>

        <Field label="Email" optional error={errors.email}>
          <input
            class={INPUT}
            name="email"
            type="email"
            autocomplete="email"
            value={values.email ?? promoter.email ?? ""}
          />
        </Field>

        <Field
          label="Your tier"
          hint="Your tier is set by your supervisor — it is what this training certifies, so it is not yours to change."
        >
          <span class={locked}>
            {promoter.tier} Sales Agent
            <span class="shrink-0 text-muted" aria-hidden="true">
              <FiLock size={16} />
            </span>
          </span>
        </Field>

        <div>
          <Button type="submit">Save changes</Button>
        </div>
      </form>
    </Card>
  );
}

export default ProfileForm;
