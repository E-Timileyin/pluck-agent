import { FiEye } from 'react-icons/fi';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Field, INPUT } from '../common/Field';
import type { Settings } from '../../db/schema';
import { formatPhone } from '../../lib/phone';

export function SettingsForm(props: {
  settings: Settings;
  values?: { supportPhone?: string; supportEmail?: string };
  errors?: Record<string, string>;
}) {
  const { settings } = props;
  const errors = props.errors ?? {};

  return (
    <div class="grid gap-4">
      <form method="post" action="/admin/settings" class="contents">
      <Card
        title="The rules the quiz runs by"
        sub="Both apply from the next answer onwards. Past results keep the pass mark they were scored against."
      >
        <div class="grid gap-5 sm:grid-cols-2">
          <Field
            label="Pass mark (%)"
            hint="A sales agent must also get every compliance question right, whatever the overall score."
            error={errors.passMark}
          >
            <input
              class={INPUT}
              name="passMark"
              type="number"
              min={1}
              max={100}
              required
              value={String(settings.passMark)}
            />
          </Field>

          <Field
            label="Tutorial gate (seconds)"
            hint="Enforced on the server. The countdown on the training screen is display only."
            error={errors.minTutorialSeconds}
          >
            <input
              class={INPUT}
              name="minTutorialSeconds"
              type="number"
              min={0}
              max={3600}
              required
              value={String(settings.minTutorialSeconds)}
            />
          </Field>
        </div>

      </Card>

      <Card
        title="Support desk"
        sub="What a stuck sales agent sees on the Support screen. Leave either blank and that route simply is not offered — the screen never invents a number."
      >
        <div class="grid gap-5 sm:grid-cols-2">
          <Field label="Support phone" optional error={errors.supportPhone}>
            <input
              class={INPUT}
              name="supportPhone"
              type="tel"
              inputmode="tel"
              placeholder="08012345678"
              value={props.values?.supportPhone ?? formatPhone(settings.supportPhone ?? '')}
            />
          </Field>

          <Field label="Support email" optional error={errors.supportEmail}>
            <input
              class={INPUT}
              name="supportEmail"
              type="email"
              placeholder="support@pluck.ng"
              value={props.values?.supportEmail ?? settings.supportEmail ?? ''}
            />
          </Field>
        </div>

        <div class="mt-5">
          <Button type="submit">Save settings</Button>
        </div>
      </Card>
      </form>

      <Card
        title="Certificate"
        sub="What a sales agent gets after passing. Preview the design with sample data — no real record needed."
      >
        <Button href="/admin/certificate/preview" tone="ghost">
          <FiEye size={18} />
          Preview certificate
        </Button>
      </Card>
    </div>
  );
}

export default SettingsForm;
