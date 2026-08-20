import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Field, INPUT } from '../common/Field';

export type SingleAgentValues = {
  agentId?: string;
  name?: string;
  email?: string;
  phone?: string;
};

/**
 * The one-off case: a single sales agent who joined after the last export, or
 * a correction that isn't worth re-uploading the whole sheet for.
 */
export function SingleAgentForm(props: {
  values?: SingleAgentValues;
  errors?: Record<string, string>;
}) {
  const values = props.values ?? {};
  const errors = props.errors ?? {};

  return (
    <Card title="Add one sales agent" sub="For a single agent who joined after your last upload.">
      <form method="post" action="/admin/promoters" class="grid gap-5">
        <div class="grid gap-4 sm:grid-cols-2">
          <Field label="Sales Agent ID" error={errors.agentId}>
            <input
              class={INPUT}
              name="agentId"
              type="text"
              maxlength={40}
              placeholder="SAG392585"
              required
              value={values.agentId ?? ''}
            />
          </Field>

          <Field label="Name" error={errors.name}>
            <input
              class={INPUT}
              name="name"
              type="text"
              maxlength={80}
              placeholder="Jane Doe"
              required
              value={values.name ?? ''}
            />
          </Field>

          <Field label="Email" error={errors.email}>
            <input
              class={INPUT}
              name="email"
              type="email"
              placeholder="jane@example.com"
              required
              value={values.email ?? ''}
            />
          </Field>

          <Field label="Phone number" error={errors.phone}>
            <input
              class={INPUT}
              name="phone"
              type="tel"
              inputmode="tel"
              placeholder="08012345678"
              required
              value={values.phone ?? ''}
            />
          </Field>
        </div>

        <div>
          <Button type="submit">Add sales agent</Button>
        </div>
      </form>
    </Card>
  );
}

export default SingleAgentForm;
