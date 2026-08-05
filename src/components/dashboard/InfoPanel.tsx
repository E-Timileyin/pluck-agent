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
export function InfoPanel(props: { promoter: Promoter }) {
  const { promoter } = props;

  const rows: { Icon: IconType; label: string; value: string }[] = [
    { Icon: FiUser, label: 'Name', value: promoter.name },
    { Icon: FiPhone, label: 'Phone', value: formatPhone(promoter.phone) },
    { Icon: FiTag, label: 'Tier', value: `${promoter.tier} Promoter` },
    {
      Icon: FiCalendar,
      label: 'Member since',
      value: `Member since ${memberSince(promoter.createdAt)}`,
    },
  ];

  return (
    <div class="mt-8 grid gap-4 lg:mt-0">
      <section class="rounded-2xl border border-line bg-white p-6">
        <h2 class="m-0 mb-4 text-lg font-semibold text-ink">Your Information</h2>
        <dl class="m-0 grid gap-3.5">
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

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <section class="rounded-2xl bg-brand-tint p-6">
          <h2 class="m-0 mb-3 flex items-center gap-3 text-lg font-semibold text-ink">
            <span
              class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand"
              aria-hidden="true"
            >
              <FiShield size={20} />
            </span>
            Why This Matters
          </h2>
          <p class="m-0 text-sm/[1.6] text-muted">
            This training ensures you understand our policies and best practices. Your certification
            helps you build trust with customers and grow your career.
          </p>
        </section>

        <section class="rounded-2xl border border-line bg-white p-6">
          <h2 class="m-0 mb-3 text-lg font-semibold text-ink">Need Help?</h2>
          <p class="m-0 mb-4 text-sm/[1.6] text-muted">
            If you have any questions or need assistance, our support team is here to help.
          </p>
          {/* No support desk exists to route this anywhere yet. */}
          <span
            class="flex min-h-12 w-full cursor-not-allowed items-center justify-center gap-2.5 rounded-xl bg-brand-mint px-4 text-[15px] font-semibold text-brand-deep"
            aria-disabled="true"
          >
            <FiHeadphones size={20} />
            Contact Support
          </span>
        </section>
      </div>
    </div>
  );
}

export default InfoPanel;
