import type { IconType } from 'react-icons';
import { FiCalendar, FiHeadphones, FiPhone, FiShield, FiTag, FiUser } from 'react-icons/fi';
import { formatPhone } from '../../lib/phone';
import type { Promoter } from '../../db/schema';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function memberSince(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/**
 * The right rail on desktop; below lg these cards fall to the bottom of the
 * page, with the last two side by side.
 *
 * The promoter's own phone number is fine to show them here — the rule it must
 * not break is never appearing in a URL or a log line.
 */
export function InfoPanel(props: { promoter: Promoter; supportPhone?: string | null }) {
  const { promoter } = props;

  const rows: { Icon: IconType; label: string; value: string }[] = [
    { Icon: FiUser, label: 'Name', value: promoter.name },
    { Icon: FiPhone, label: 'Phone', value: formatPhone(promoter.phone) },
    { Icon: FiTag, label: 'Tier', value: `${promoter.tier} Sales Agent` },
    {
      Icon: FiCalendar,
      label: 'Member since',
      value: `Member since ${memberSince(promoter.createdAt)}`,
    },
  ];

  return (
    <div class="mt-3 grid gap-3 lg:mt-0">
      <section class="rounded-2xl border border-line bg-white p-4 lg:p-5">
        <h2 class="m-0 mb-3 text-base font-semibold text-ink">Your Information</h2>
        <dl class="m-0 grid gap-2.5">
          {rows.map(({ Icon, label, value }) => (
            <div class="flex items-center gap-3">
              <dt class="flex shrink-0 text-muted" aria-label={label}>
                <Icon size={18} />
              </dt>
              <dd class="m-0 min-w-0 text-[15px] text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <section class="rounded-2xl bg-brand-tint p-4 lg:p-5">
          <h2 class="m-0 mb-2 flex items-center gap-2.5 text-base font-semibold text-ink">
            <span
              class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-brand"
              aria-hidden="true"
            >
              <FiShield size={16} />
            </span>
            Why This Matters
          </h2>
          <p class="m-0 text-[13px]/[1.5] text-muted">
            This training ensures you understand our policies and best practices. Your certification
            helps you build trust with customers and grow your career.
          </p>
        </section>

        <section class="rounded-2xl border border-line bg-white p-4 lg:p-5">
          <h2 class="m-0 mb-2 text-base font-semibold text-ink">Need Help?</h2>
          <p class="m-0 mb-3 text-[13px]/[1.5] text-muted">
            {props.supportPhone
              ? 'Stuck on the material, the quiz or your phone number? The support desk can help.'
              : 'If you have any questions or need assistance, the Support screen explains what to do.'}
          </p>
          {/* Always the Support screen, never a raw tel: link — that screen is
              where the answer usually is, and it offers the call itself. */}
          <a
            class="flex min-h-11 w-full items-center justify-center gap-2.5 rounded-xl bg-brand-mint px-4 text-sm font-semibold text-brand-deep no-underline transition-colors duration-150 hover:bg-brand hover:text-white"
            href="/support"
          >
            <FiHeadphones size={17} />
            Contact Support
          </a>
        </section>
      </div>
    </div>
  );
}

export default InfoPanel;
