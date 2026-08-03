import { FieldError } from '../common/FieldError';
import './StartForm.css';

export type StartValues = { name?: string; phone?: string; tier?: string; email?: string };

const TIERS = ['SP3', 'SP2', 'SP1'] as const;

/** Phone is the identifier, not email — see flow.md §1. */
export function StartForm(props: { values?: StartValues; errors?: Record<string, string> }) {
  const values = props.values ?? {};
  const errors = props.errors ?? {};

  return (
    <form method="post" action="/start" class="card stack startform">
      <label class="field">
        <span class="label">Full name</span>
        <input name="name" type="text" autocomplete="name" maxlength={80} required value={values.name ?? ''} />
        <FieldError message={errors.name} />
      </label>

      <label class="field">
        <span class="label">Phone number</span>
        <input
          name="phone"
          type="tel"
          inputmode="tel"
          autocomplete="tel"
          placeholder="08012345678"
          required
          value={values.phone ?? ''}
        />
        <FieldError message={errors.phone} />
      </label>

      <label class="field">
        <span class="label">
          Email <span class="muted"></span>
        </span>
        <input name="email" type="email" autocomplete="email" value={values.email ?? ''} />
        <FieldError message={errors.email} />
      </label>

      <fieldset class="field">
        <legend class="label">Your tier</legend>
        <div class="tiers">
          {TIERS.map((tier) => (
            <label class="tier">
              <input type="radio" name="tier" value={tier} checked={(values.tier ?? 'SP3') === tier} />
              <span>{tier}</span>
            </label>
          ))}
        </div>
        <FieldError message={errors.tier} />
      </fieldset>

      <button class="btn btn-primary" type="submit">
        Start training
      </button>
    </form>
  );
}

export default StartForm;
