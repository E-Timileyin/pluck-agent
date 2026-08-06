import { FiMail, FiPhone } from 'react-icons/fi';
import { Card } from '../common/Card';
import { formatPhone } from '../../lib/phone';

/**
 * The support desk, as configured in Admin → Settings.
 *
 * Nothing here is invented: with neither a number nor an address published,
 * this says so plainly rather than showing a placeholder that dials nowhere.
 */
export function ContactCard(props: { phone: string | null; email: string | null }) {
  const has = props.phone || props.email;

  return (
    <Card
      title="Talk to somebody"
      sub={
        has
          ? 'Weekday working hours. Have your phone number to hand — it is how your record is found.'
          : undefined
      }
    >
      {!has ? (
        <p class="m-0 text-[15px]/[1.6] text-muted">
          No support desk has been published for this training yet. Ask your supervisor, or the
          person who sent you the training link.
        </p>
      ) : (
        <div class="grid gap-3 sm:grid-cols-2">
          {props.phone ? (
            <a
              class="flex items-center gap-3 rounded-xl border border-line p-4 no-underline transition-colors duration-150 hover:border-brand"
              href={`tel:${props.phone}`}
            >
              <span
                class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-mint text-brand-deep"
                aria-hidden="true"
              >
                <FiPhone size={20} />
              </span>
              <span class="min-w-0">
                <span class="block text-[13px] text-muted">Call</span>
                <span class="block truncate text-[15px] font-semibold text-ink">
                  {formatPhone(props.phone)}
                </span>
              </span>
            </a>
          ) : null}

          {props.email ? (
            <a
              class="flex items-center gap-3 rounded-xl border border-line p-4 no-underline transition-colors duration-150 hover:border-brand"
              href={`mailto:${props.email}`}
            >
              <span
                class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-mint text-brand-deep"
                aria-hidden="true"
              >
                <FiMail size={20} />
              </span>
              <span class="min-w-0">
                <span class="block text-[13px] text-muted">Email</span>
                <span class="block truncate text-[15px] font-semibold text-ink">{props.email}</span>
              </span>
            </a>
          ) : null}
        </div>
      )}
    </Card>
  );
}

export default ContactCard;
